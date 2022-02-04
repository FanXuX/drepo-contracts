// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./RepositoryIndex.sol";

import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Naive Implementation of the decentralized Repository Index Interface
 *      This implementation is not optimized
 */
contract NaiveRepositoryIndex is
  RepositoryIndex,
  Context {

    // TODO: Add events

  struct Group {
    address[] owners;
    mapping(string => Package) packages;
    string[] packageNames;
    bool exists;
  }

  struct Package {
    mapping(string => Release) releases;
    string[] versions;
    bool exists;
  }

  struct Release {
    string[] content;
    bool nuked;
  }

  mapping(string => Group) private _groups;

  modifier onlyGroupOwner(string memory groupName) {
    Group storage group = _groups[groupName];

    require(group.exists, "RepoIndex: group does not exist");

    bool isOwner = false;
    for (uint i = 0; i < group.owners.length; i++) {
      if (group.owners[i] == _msgSender()) {
        isOwner = true;
        break;
      }
    }

    require(isOwner, "RepoIndex: msg sender is not owner");
    _;
  }

  function register(string memory groupName) external override {
    Group storage group = _groups[groupName];

    require(!group.exists, "RepoIndex: group does already exist");

    group.exists = true;
    group.owners.push(_msgSender());
  }

  function addOwner(string memory groupName, address newOwner)
    external override onlyGroupOwner(groupName) {

    Group storage group = _groups[groupName];
    group.owners.push(newOwner);
  }

  function removeOwner(string memory groupName, address owner)
    external override onlyGroupOwner(groupName) {

    Group storage group = _groups[groupName];
    if (group.owners.length == 1) {
      // owner deletes himself
      group.owners.pop();
    } else {
      uint index = 0;
      for (uint i = 0; i < group.owners.length; i++) {
        if (group.owners[i] == owner) {
          index = i + 1; // hack
          break;
        }
      }

      require(index > 0, "RepoIndex: user is not part of owner group");

      group.owners[index - 1] = group.owners[group.owners.length-1];
      group.owners.pop();
    }
  }


  function release( string memory groupName,
                    string memory package,
                    string memory version,
                    string[] memory content) external override
                    onlyGroupOwner(groupName) {

    require(content.length > 0, "RepoIndex: no content provided");

    Group storage group = _groups[groupName];
    if (!group.packages[package].exists) {
      group.packages[package].exists = true;
      group.packageNames.push(package);
    }
    if (group.packages[package].releases[version].content.length == 0) {
      group.packages[package].versions.push(package);
    }

    _addContent(groupName, package, version, content);
  }

  function nuke( string memory groupName,
                    string memory package,
                    string memory version,
                    string[] memory content) external override
                    onlyGroupOwner(groupName) {

    Group storage group = _groups[groupName];
    Release storage _release = group
                              .packages[package]
                              .releases[version];

    _addContent(groupName, package, version, content);
    _release.nuked = true;
  }

  function _addContent( string memory groupName,
                        string memory package,
                        string memory version,
                        string[] memory content) internal {
    Group storage group = _groups[groupName];
    string[] storage _content = group
                                .packages[package]
                                .releases[version]
                                .content;

    for (uint i = 0; i < content.length; i++) {
      _content.push(content[i]);
    }
  }

  function groupExists(string memory groupName)
    external view override returns (bool) {

      return _groups[groupName].exists;
  }

  function packages(string memory groupName)
    external view override returns (string[] memory) {
      return _groups[groupName].packageNames;
    }

  function releases(string memory groupName,
                    string memory package)
    external view override returns (string[] memory) {
      return _groups[groupName].packages[package].versions;
    }

  function getRelease(string memory groupName,
                      string memory package,
                      string memory version
                      ) external view override returns (
                        string[] memory content,
                        bool nuked) {

      Release storage r = _groups[groupName].packages[package].releases[version];
      content = r.content;
      nuked = r.nuked;
  }

  function owners(string memory groupName)
    external view override returns (address[] memory) {

      Group storage group = _groups[groupName];
      return group.owners;
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


/**
 * @dev Interface of the decentralized Repository Index
 */
interface RepositoryIndex {

  function register(string memory groupName) external;

  function addOwner(string memory groupName, address newOwner) external;

  function removeOwner(string memory groupName, address owner) external;

  function release( string memory groupName,
                    string memory package,
                    string memory version,
                    string[] memory content) external;

  function nuke( string memory groupName,
                    string memory package,
                    string memory version,
                    string[] memory content) external;


  function groupExists(string memory groupName)
                    external view returns (bool);

  function packages(string memory groupName)
                    external view returns (string[] memory);

  function releases(string memory groupName,
                    string memory package)
                    external view returns (string[] memory);

  function getRelease(string memory groupName,
                      string memory package,
                      string memory version
                      ) external view returns ( string[] memory content,
                                                bool nuked);

  function owners(string memory groupName)
                  external view returns (address[] memory);
}

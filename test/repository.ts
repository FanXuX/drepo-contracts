import { NaiveRepositoryIndexInstance } from "../types/truffle-contracts";

const NaiveRepositoryIndex = artifacts.require("NaiveRepositoryIndex");

contract("NaiveRepositoryIndex", async accounts => {
  const owner = "" + accounts[0];
  const other = "" + accounts[1];

  const setup:
    () => Promise<NaiveRepositoryIndexInstance> =
    async () => {
      const repo = await NaiveRepositoryIndex.new();

      return repo;
    }

  it("should register a new group", async () => {
    const repo = await setup();
    const groupName = "hello-world";

    assert.isFalse(await repo.groupExists(groupName));

    await repo.register(groupName);

    assert.isTrue(await repo.groupExists(groupName));

  });

  it("should fail to register again", async () => {
    const repo = await setup();
    const groupName = "hello-world";

    assert.isFalse(await repo.groupExists(groupName));

    await repo.register(groupName);
    await repo.register(groupName).then(
      () => assert.fail(),
      () => Promise.resolve()
    );

  });

  it("should add a new owner", async () => {
    const repo = await setup();
    const groupName = "hello-world";

    await repo.register(groupName);
    const startOwners = await repo.owners(groupName);

    assert.equal(1, startOwners.length);

    await repo.addOwner(groupName, other);
    const owners = await repo.owners(groupName);

    assert.equal(2, owners.length);
  });

  it("should remove the owner", async () => {
    const repo = await setup();
    const groupName = "hello-world";

    await repo.register(groupName);

    await repo.removeOwner(groupName, owner);
    const owners = await repo.owners(groupName);

    assert.equal(0, owners.length);
  });

  it("should remove an owner", async () => {
    const repo = await setup();
    const groupName = "hello-world";

    await repo.register(groupName);

    await repo.addOwner(groupName, other);
    await repo.removeOwner(groupName, owner);
    const owners = await repo.owners(groupName);

    assert.equal(1, owners.length);
    assert.equal(owners[0], other);
  });

  it("should fail to release by other", async () => {
    const repo = await setup();
    const groupName = "hello-world";
    const packageName = "myLib";
    const version = "1.2.1";
    const content = ["somelink", "somelink2"];

    await repo.register(groupName);

    await repo.release(groupName, packageName, version, content, { from: other })
      .then(
        () => assert.fail(),
        () => Promise.resolve()
      );
  });

  it("should release a new version", async () => {
    const repo = await setup();
    const groupName = "hello-world";
    const packageName = "myLib";
    const version = "1.2.1";
    const content = ["somelink", "somelink2"];

    await repo.register(groupName);

    await repo.release(groupName, packageName, version, content);

    const r = await repo.getRelease(groupName, packageName, version);
    assert.deepEqual(content, r[0]);
    assert.isFalse(r[1]);
  });

  it("should add content to version", async () => {
    const repo = await setup();
    const groupName = "hello-world";
    const packageName = "myLib";
    const version = "1.2.1";
    const content = ["somelink", "somelink2"];
    const content2 = ["somelink3", "somelink4"];

    await repo.register(groupName);

    await repo.release(groupName, packageName, version, content);
    await repo.release(groupName, packageName, version, content2);

    const r = await repo.getRelease(groupName, packageName, version);
    assert.deepEqual(content.concat(content2), r[0]);
    assert.isFalse(r[1]);
  });

  it("should nuke a version", async () => {
    const repo = await setup();
    const groupName = "hello-world";
    const packageName = "myLib";
    const version = "1.2.1";
    const content = ["somelink", "somelink2"];

    await repo.register(groupName);

    await repo.release(groupName, packageName, version, content);
    await repo.nuke(groupName, packageName, version, []);

    const r = await repo.getRelease(groupName, packageName, version);
    assert.deepEqual(content, r[0]);
    assert.isTrue(r[1]);
  });

  it("should multiple releases", async () => {
    const repo = await setup();
    const groupName = "hello-world";
    const packageName = "myLib";
    const version = "1.2.1";
    const version2 = "1.2.2";
    const content = ["somelink", "somelink2"];

    await repo.register(groupName);

    await repo.release(groupName, packageName, version, content);
    await repo.release(groupName, packageName, version2, content);

    const r = await repo.getRelease(groupName, packageName, version);
    assert.deepEqual(content, r[0]);
    assert.isFalse(r[1]);
    const r2 = await repo.getRelease(groupName, packageName, version2);
    assert.deepEqual(content, r2[0]);
    assert.isFalse(r2[1]);
  });
});


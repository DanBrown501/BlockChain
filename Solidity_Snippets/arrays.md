## Represent a collection of data

```
struct Users {
  uint id;
  string name;
}
User[] users;
uint nextUserId;
```

## Return array

With ABIEncoderV2 (good for production in Solidity 0.6):

```
pragma experiemental ABIEncoderV2;

struct User {...}
User[] users;

function getUsers() returns (User[] memory) {
  return users;
}
```

Without ABIEncoderV2:
```
pragma experiemental ABIEncoderV2;

struct User {
  uint id; 
  string name
}
User[] users;
uint nextUserId;

function getUsers() returns (User[] memory) {
  uint[] memory userIds = new uint[](users.length);
  string[] memory userNames = new string[](users.length);
  for(uint i = 0; i < users.length; i++) {
    userIds[i] = users[i].id;
    userNames[i] = users[i].name;
  }
  return (userIds, userNames);
}
```

## Removing array elements without holes:

```
pragma solidity ^0.6.0;

contract MyContract {
  string[] public data;

  constructor() public {
    data.push("John");
    data.push("Bruce");
    data.push("Tom");
    data.push("Bart");
    data.push("Cherry");
  }

  function removeNoOrder(uint index) external {
    data[index] = data[data.length - 1];
    data.pop();
  }

  function removeInOrder(uint index) external {
    for(uint i = index; i <  data.length - 1; i++) {
      data[i] = data[i + 1];
    }
    data.pop();
  }
}
```
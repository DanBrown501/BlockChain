## 2 ways to create a struct

//Method 1
```
struct User {
  uint id;
  string name;
}
...
User memory user = User(1, "James");
```

//Method 2
```
User memory user = User({id: 1, name: "James"}); //parameters can be out-of-order
```

## Struct with nested mapping

How to create a new struct and put it in a mapping of struct?

```
Struct User {
  uint id;
  string name;
  mapping(uint => true) isOwnerOf;
}
mapping(uint => users);
...
//cannot do this as `memory` mapping are not possible
User memory user = User(..., mapping(1 => true));
users[0] = user;

//Instead, have to leverage the fact that its possible to access any mapping entry, including non-existing one:
users[0].id = 0;
users[0].name = "James";
users[0].isOwnerOf[10] = true;
```
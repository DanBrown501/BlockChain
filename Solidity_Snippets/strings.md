## Test that string is empty

```
if(bytes(stringVar).length === 0) {...}
```

## Concatenate 2 strings

```
bytes memory b;

b = abi.encodePacked("hello");
b = abi.encodePacked(b, " world");

string memory s = string(b);
```

Alternative method - need to compare which one is more gas efficient:

```
import "github.com/Arachnid/solidity-stringutils/strings.sol";

contract C {
  using strings for *;
  string public s;

  function foo(string s1, string s2) {
    s = s1.toSlice().concat(s2.toSlice());
  }
}
```
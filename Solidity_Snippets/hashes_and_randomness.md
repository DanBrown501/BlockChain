Generate a Hash:

```
bytes32 hash = keccak256(abi.encodePacked(varA, varB, varC));
```

Generate a random number:

```
uint nonce;
function generateRandom(uint modulo) public returns(uint) {
  uint random = uint(keccak256(abi.encodePacked(now, msg.sender, nonce))) % modulo;
  nonce++;
  return random;
}
```
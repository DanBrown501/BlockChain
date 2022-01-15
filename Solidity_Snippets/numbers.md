## Safe division and multiplication to avoid underflow / overflow
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
contract MyContract {
  using SafeMath for uint;
  uint a;
  uint b;
  ...
  //Now you can do:
  a.add(b);
  a.div(b);
}
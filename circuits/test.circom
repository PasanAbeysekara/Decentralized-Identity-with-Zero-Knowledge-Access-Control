include "../node_modules/circomlib/circuits/comparators.circom";

template Test() {
    signal input a;
    signal output b;
    b <== a;
}

component main = Test();

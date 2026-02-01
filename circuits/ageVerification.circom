pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

// Age Verification Circuit
// Proves that age >= minAge without revealing actual birthdate
template AgeVerification() {
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    signal input minAge;
    signal input salt;  // For privacy
    
    signal output ageProof;
    signal output commitment;
    
    // Calculate age
    signal yearDiff;
    yearDiff <== currentYear - birthYear;
    
    // Check if birthday has passed this year
    signal monthPassed;
    component monthComp = GreaterEqThan(8);
    monthComp.in[0] <== currentMonth;
    monthComp.in[1] <== birthMonth;
    monthPassed <== monthComp.out;
    
    signal dayPassed;
    component dayComp = GreaterEqThan(8);
    dayComp.in[0] <== currentDay;
    dayComp.in[1] <== birthDay;
    dayPassed <== dayComp.out;
    
    signal birthdayPassed;
    birthdayPassed <== monthPassed * dayPassed;
    
    // Actual age
    signal age;
    age <== yearDiff - 1 + birthdayPassed;
    
    // Verify age >= minAge
    component ageCheck = GreaterEqThan(8);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minAge;
    ageProof <== ageCheck.out;
    
    // Create commitment to hide birthdate
    component hasher = Poseidon(4);
    hasher.inputs[0] <== birthYear;
    hasher.inputs[1] <== birthMonth;
    hasher.inputs[2] <== birthDay;
    hasher.inputs[3] <== salt;
    commitment <== hasher.out;
    
    // Ensure proof is valid
    ageProof === 1;
}

component main = AgeVerification();
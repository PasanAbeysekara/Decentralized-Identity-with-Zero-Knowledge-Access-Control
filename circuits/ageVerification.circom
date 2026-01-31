pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

/**
 * Age Verification Circuit
 * Proves that a user is above a certain age without revealing their actual age or birthdate
 */
template AgeVerification() {
    // Private inputs
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    signal input salt; // For privacy
    
    // Public inputs
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    signal input minAge;
    signal input credentialHash; // Hash of the credential
    
    // Output
    signal output isValid;
    
    // Components for comparisons
    component yearCheck = GreaterEqThan(32);
    component monthCheck = GreaterEqThan(32);
    component dayCheck = GreaterEqThan(32);
    
    // Calculate age in years
    var ageYears = currentYear - birthYear;
    
    // Adjust age if birthday hasn't occurred this year
    var birthdayPassed = 0;
    if (currentMonth > birthMonth) {
        birthdayPassed = 1;
    } else if (currentMonth == birthMonth && currentDay >= birthDay) {
        birthdayPassed = 1;
    }
    
    var actualAge = birthdayPassed == 1 ? ageYears : ageYears - 1;
    
    // Check if age meets minimum requirement
    yearCheck.in[0] <== actualAge;
    yearCheck.in[1] <== minAge;
    
    // Verify credential hash (proves ownership without revealing data)
    component hasher = Poseidon(4);
    hasher.inputs[0] <== birthYear;
    hasher.inputs[1] <== birthMonth;
    hasher.inputs[2] <== birthDay;
    hasher.inputs[3] <== salt;
    
    // Ensure the hash matches
    credentialHash === hasher.out;
    
    // Output validation result
    isValid <== yearCheck.out;
}

component main {public [currentYear, currentMonth, currentDay, minAge, credentialHash]} = AgeVerification();

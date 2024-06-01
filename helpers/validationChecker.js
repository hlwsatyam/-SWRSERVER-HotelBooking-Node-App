function isGmail(email) {
  
  var gmailRegex = /^[a-zA-Z0-9._-]+@gmail.com$/;
  
  return gmailRegex.test(email);
}
function isStrings(text) {
  if (text?.length === 0) {
    return false;
  }
  var stringRegex = /^[a-zA-Z\s]*$/;
  return stringRegex.test(text);
}
function isMobileNumber(number) {
  var indianRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
  var internationalRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  return indianRegex.test(number) || internationalRegex.test(number);
} 
function isNumbers(text) {
  var numberRegex = /^[0-9]+$/;
  return numberRegex.test(text);
}

module.exports = { isGmail, isStrings, isMobileNumber, isNumbers };

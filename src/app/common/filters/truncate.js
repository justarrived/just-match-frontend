angular.module('just.truncate', [])
    .filter('truncate', function () {
        return function(string, length) {
            var 
                parts = [],
                truncatedString = '';

            if(string.length <= length) {
                return string;
            }

            console.log(string);

            truncatedString = string.substr(0, length);
            console.log([' ', '.', ',', '!', '?'].indexOf(truncatedString.substr(truncatedString.length - 1)));
            // Don't end on puncuation or whitespace
            if([' ', '.', ',', '!', '?'].indexOf(truncatedString.substr(truncatedString.length - 1)) > -1) {
                truncatedString.substr(0, truncatedString.length - 1);
            }

            truncatedString += '…';

            return truncatedString;
        };
    });
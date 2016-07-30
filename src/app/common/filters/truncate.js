angular.module('just.truncate', [])
    .filter('truncate', function () {
        return function(string, length) {
            var truncatedString = '';

            if(string.length <= length) {
                return string;
            }

            truncatedString = string.substr(0, length);

            // Don't end on puncuation or whitespace
            if([' ', '.', ',', '!', '?'].indexOf(truncatedString.substr(truncatedString.length - 1)) > -1) {
                truncatedString = truncatedString.substr(0, truncatedString.length - 1);
            }

            truncatedString += '…';

            return truncatedString;
        };
    });
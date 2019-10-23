/**
 * Eveything for device detection
 */
var os = [
   { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
   { name: 'Windows', value: 'Win', version: 'NT' },
   { name: 'iPhone', value: 'iPhone', version: 'OS' },
   { name: 'iPad', value: 'iPad', version: 'OS' },
   { name: 'Kindle', value: 'Silk', version: 'Silk' },
   { name: 'Android', value: 'Android', version: 'Android' },
   { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
   { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
   { name: 'Macintosh', value: 'Mac', version: 'OS X' },
   { name: 'Linux', value: 'Linux', version: 'rv' },
   { name: 'Palm', value: 'Palm', version: 'PalmOS' }
];

var browser = [
   { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
   { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
   { name: 'Safari', value: 'Safari', version: 'Version' },
   { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
   { name: 'Opera', value: 'Opera', version: 'Opera' },
   { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
   { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
];

var header = [
   navigator.platform,
   navigator.userAgent,
   navigator.appVersion,
   navigator.vendor,
   window.opera
];

function matchItem(string, data) {
   var i = 0,
      j = 0,
      html = '',
      regex,
      regexv,
      match,
      matches,
      version;

   for (i = 0; i < data.length; i += 1) {
      regex = new RegExp(data[i].value, 'i');
      match = regex.test(string);
      if (match) {
         regexv = new RegExp(data[i].version + '[- /:;]([d._]+)', 'i');
         matches = string.match(regexv);
         version = '';
         if (matches) {
            if (matches[1]) {
               matches = matches[1];
            }
         }
         if (matches) {
            matches = matches.split(/[._]+/);
            for (j = 0; j < matches.length; j += 1) {
               if (j === 0) {
                  version += matches[j] + '.';
               } else {
                  version += matches[j];
               }
            }
         } else {
            version = '0';
         }
         return {
            name: data[i].name,
            version: parseFloat(version)
         };
      }
   }
   return { name: 'unknown', version: 0 };
}

function getBrowser() {
   var agent = header.join(' ');
   var myBrowser = this.matchItem(agent, browser);
   //console.log(myBrowser.name);
   return myBrowser.name;
}

function getOS() {
   var agent = header.join(' ');
   var myOS = this.matchItem(agent, os);
   //console.log(myOS.name);
   return myOS.name;
}



/**
 * Cookie manager section
 */
//constant cookie name
var visitedCookieName = 'mintmeasureid';

//checks for a cookie to see if a visiotr is a repeat visitor then returns true or false
//if not a repeat visitor, a cookie is created to mark them as having visited
//true and false returned as strings to easily pass into the pixel src
function checkForMintMeasureCookie() {
   if (document.cookie.search(visitedCookieName) === -1) {
      //console.log("new visitor")
      createVisitorCookie();
      return 'false';
   } else {
      return 'true';
   }
}

//function for creating new cookie
function createVisitorCookie() {
   //console.log('creating cookie')
   document.cookie = visitedCookieName + '=' + generateCookieId()+ '; expires=' + getExpiryDate();
   //console.log(document.cookie)
}

function generateCookieId(){
   return crypto.getRandomValues(new Uint32Array(4)).join('-');
}

function getCookieId(){
   var name = visitedCookieName + "=";
   var decodedCookie = decodeURIComponent(document.cookie);
   //console.log(decodedCookie);
   var ca = decodedCookie.split(';');
   for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

//sets expirt for cookies to 30 days
function getExpiryDate() {
   var expiry = new Date();
   var today = new Date(Date.now());
   expiry.setDate(today.getDate() + 30);
   //console.log(expiry.toISOString());
   return expiry;
}

/**
 * Section for the mintMeasurePixel
 */

/**
 * REQUIRE
 * @param {link} src
 * @param {function} success
 * @param {function} failure
 */
// make sure we grab dependencies before we move on
var require = function(src, success, failure) {
   !(function(source, success_cb, failure_cb) {
      var script = document.createElement('script');
      script.async = true;
      script.type = 'text/javascript';
      script.src = source;
      script.onload = success_cb || function(e) {};
      script.onerror = failure_cb || function(e) {};
      (
         document.getElementsByTagName('head')[0] ||
         document.getElementsByTagName('body')[0]
      ).appendChild(script);
   })(src, success, failure);
};

require('https://cdnjs.cloudflare.com/ajax/libs/fingerprintjs2/2.1.0/fingerprint2.js', () => {
   //console.log('FingerPrint is ready to use');

   //set base pixel address that we will add fields to
   var pixelAddress = 'https://mintmeasurepixelapi20190826055125.azurewebsites.net/api/sitepixel';
   var querystring = '?';
   var repeatVisitor = checkForMintMeasureCookie();
   var cookieId = getCookieId();
   var today = new Date(Date.now());
   var os = getOS();
   var browser = getBrowser();
   campaignId = '001';
   //console.log(today.toISOString());
   //console.log(os);
   //console.log(browser);
   //console.log(repeatVisitor);
   var fingerprint = '69';

   var options = {
      NOT_AVAILABLE: 'not available',
      ERROR: 'error',
      EXCLUDED: 'excluded'
   };
   Fingerprint2.get(options, function(components) {
      var values = components.map(function(component) {
         return component.value;
      });
      fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
      //console.log(fingerprint);
      afterFirgerprintIsCalculated();
   });

   function afterFirgerprintIsCalculated() {
      //console.log(fingerprint);
      createQueryString();
   }

   function createQueryString() {
      querystring += 'campaignId=' + campaignId + '&';
      querystring += 'medium=' + 'video' + '&';
      querystring += 'siteId=' + 'AffectTvVideo' + '&';
      querystring += 'cookieId=' + cookieId + '&';
      querystring += 'deviceId=' + fingerprint + '&';
      querystring += 'os=' + os + '&';
      querystring += 'browser=' + browser + '&';
      querystring += 'timestamp=' + today.toISOString();
      
      //append query to pixel address
      pixelAddress += querystring;
      document.getElementById('mintmeasurepixel').src = pixelAddress;
   }
   //write the pixel address
}, () => {
   console.log('Something went wrong loading this script');
});

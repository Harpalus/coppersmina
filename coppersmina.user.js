// ==UserScript==
// @name        Coppersmina
// @namespace   github.com/ariacorrente/coppersmina
// @description Enhances Coppermine galleries with direct links, color coded border and other tricks. See source code for more info and settings.
// @version     0.6
// @downloadURL https://raw.githubusercontent.com/ariacorrente/coppersmina/master/coppersmina.user.js
// @match       http://*/*
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

/*
Copyright (C) 2014  ariacorrente

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Contact: https://github.com/ariacorrente/coppersmina
*/

/*
# Coppersmina

User script that enhances Coppermine galleries with direct links, color coded
border and other tiny features.

Allows the use of mass downloaders like DownThemAll! and FlashGot.

## Features

- Replace links in thumbnails to point directly to the high defintion image
- Add a colored border indicating the size of the image
- Append image information into the thumbnail's caption and remove the tooltip
- The "always run" feature allows the execution of the script even if the site
    is not automatically detected as a Coppermine gallery

## Settings

At the top of the script there are some variables the user can change to
customize the script behaviour.

- Choose what information to display into the capton of the thumbnail
- Toggle the display of the colored border
- Choose if the color of the border is calculated from the image KB size or the
    image dimensions
- Choose the colors to use for the border and the rages of size for each color
- Width of the colored border
- Toggle the "always run" feature
- Toggle the auto deactivation of the "always run" feature after 24 hours of the
    activation
*/

(function() {
    // START OF USER SETTINGS
    //
    // Info to display in the caption of the thumbnail
    // All the available options are:
    // var captionInfo = ['Filename, 'Filesize', 'Dimensions', 'Date added', 'Original link'];
    // An empty array will disable this feature
    var captionInfo = ['Filesize', 'Original link'];
    // If you want to clear all the info from the caption and keep only the 
    // data specified in captionInfo set this to true
    var clearOldCapiton = true;
    // If image info is under the image the tooltips are no more required
    var removeTooltips = true;
    // Add a colored border based on image size
    var colorBorder = true;
    // The border can be colored using two possible data source:
    // - "Dimensions": area of the image in pixels.
    // - "Filesize": KiloBytes of the HD image. File compession and image content may make this
    //  option less reliable.
    var colorByWhat = 'Dimensions';
    // Colors to be used for the border.
    // WARNING: The sizes must be in increasing order to work
    // Size is expressed in KB
    // Colors are CSS colors so you can use names or numbers
    var colorCode = [{size: 0,    color: 'lightgray'},
                     {size: 250,  color: 'lightgreen'},
                     {size: 500,  color: 'yellow'},
                     {size: 1000, color: 'red'},
                     {size: 2000, color: 'magenta'}];
    // Thumbnail border size in pixels (don't add unit of measure in borderSize)
    var borderSize = 3;
    // Enable the feature tu run this script even if the site is not detected as a Coppermine gallery
    var canRunAlways = true;
    // After 24 hours the "run always" feature will be disabled automatically
    var autoDisableRunAlways = true;
    //
    // END OF USER SETTINGS

    var debugMode = false;

    function clog(msg) {
        if(debugMode) {
            console.log(msg);
        }
    }

    function enableRunAlways() {
        GM_setValue("runAlways", true);
        GM_setValue("timeRunAlwaysEnabled", Date.now() );
    }

    function disableRunAlways() {
        GM_setValue("runAlways", false);
    }

    function checkRunAlways() {
        //Load saved config from disk
        var isRunAlways = GM_getValue("runAlways");
        if(isRunAlways) {
            GM_registerMenuCommand("Stop running Coppersmina in every site", disableRunAlways, 'C');
        } else {
            GM_registerMenuCommand("Run Coppersmina in every site", enableRunAlways, 'C');
        }

        if(autoDisableRunAlways) {
            //If runAlways is enabled by more than 24 hours disable automatically
            //because it's probably been forgotten enabled
            var timeEnabled = GM_getValue("timeRunAlwaysEnabled", Date.now());
            var timeNow = Date.now();
            //elapsed in ms
            var elapsed = timeNow - timeEnabled;
            elapsed = elapsed / (1000 * 60 * 60);
            if(elapsed > 24) {
                disableRunAlways();
            }
        }

        return isRunAlways;
    }

    function runCoppersmina() {
        //find all the anchors around the the thumbnails and iterate
        var anchors = document.querySelectorAll('a[href*=displayimage]');
        clog("Found " + anchors.length + " anchors");
        if(anchors.length === 0) { return; }
        for(var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            var thumbnail = anchor.querySelector('img');
            if(thumbnail === null) {
                clog("Thumbnail not found");
                continue;
            }
            //find the text field under the thumbnail
            var caption = anchor.parentNode.querySelector("span");
            if(caption ===  null) {
                clog("Caption not found");
                continue;
            }

            //replace the thumbnail link with a direct link to the HD image
            var hdUrl = thumbnail.src.replace(/thumb_/, "");
            anchors[i].href = hdUrl;

            //maybe clear the caption
            if(clearOldCapiton) {
                while(caption.firstChild) {
                    caption.removeChild(caption.firstChild);
                }
            }

            //Add info to the caption
            var regex, found;
            for(var j = 0; j < captionInfo.length; j++) {
                if(captionInfo[j] === 'Original link') {
                    //add the old link to the caption
                    var oldLink = document.createElement('a');
                    oldLink.innerHTML = "Original link";
                    oldLink.href = anchor.href;
                    caption.appendChild(document.createElement('br'));
                    caption.appendChild(oldLink);
                    continue;
                }
                regex = new RegExp(captionInfo[j] + '=(.*)');
                found = regex.exec(thumbnail.title);
                if(found !== null) {
                    var extraInfo = document.createElement('span');
                    extraInfo.innerHTML = found[1];
                    caption.appendChild(document.createElement('br'));
                    caption.appendChild(extraInfo);
                } else {
                    clog('Image info "' + captionInfo[j] + '" not found');
                }
            }

            if(colorBorder) {
                //Calculate image weight to chose a border color
                var imageWeight;
                regex = new RegExp(colorByWhat + '=(.*)');
                found = regex.exec(thumbnail.title);
                if(found) {
                    if(colorByWhat == "Dimensions") {
                        var sizes = found[1].split('x');
                        var area = sizes[0] * sizes[1];
                        //Divide to have comparable sizes with "FileSize" wich is expressed in KB
                        imageWeight = area / 8192;
                    } else {
                        //Remove last 3 characters occupied by "KiB"
                        imageWeight = found[1].slice(0, -3);
                    }
                } else {
                    clog('Image info "' + colorByWhat + '" not found, unable to color the border');
                }

                //Add the colored border to the thumbnail
                var newColor;
                for(j = 0; j < colorCode.length; j++) {
                    if(imageWeight > colorCode[j].size) {
                        newColor = colorCode[j].color;
                    }
                }
                thumbnail.style.border = borderSize + 'px solid ' + newColor;
            }

            //Remove the tooltip if required
            if(removeTooltips) {
                thumbnail.title = "";
            }
        }
    }

    var isRunAlways = false;
    if(canRunAlways) {
        isRunAlways = checkRunAlways();
    }
    // Detect if it's a coppermine gallery
    if(isRunAlways || document.querySelector('a[href*=coppermine]') !== null) {
        clog("Coppersmining");
        runCoppersmina();
    }

}());

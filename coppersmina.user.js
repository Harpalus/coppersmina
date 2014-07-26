// ==UserScript==
// @name        Coppersmina
// @namespace   github.com/ariacorrente/coppersmina
// @description Enhances Coppermine galleries with direct links, color coded border and other tricks. See source code for more info and settings.
// @version     0.3
// @downloadURL https://raw.githubusercontent.com/ariacorrente/coppersmina/master/coppersmina.user.js
// @match       http://*/*
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

/*
 * This script will run on every site.
 * First the script will check if into the page there is a link containing "coppermine", this
 * indicate the site is a Coppermine gallery. Only after this check the rest of the script
 * will be executed.
 *
 * Features:
 * - Replace links in thumbnails to point directly to the high defintion image
 * - Add a colored border indicating the size of the image
 * - Add image info to the thumbnail caption and optionally remove the tooltip
 * - Allow the execution of the script even if the site is not detected as a Copperime gallery
 */

(function() {
    // START OF USER SETTINGS
    //
    // Image info to display under the thumbnail
    // All the available options are:
    // var imageInfo = ['Filename, 'Filesize', 'Dimensions', 'Date added'];
    // Empty array disable this feature
    var imageInfo = ['Filesize'];
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
    var colorCode=[{size: 0,    color: 'lightgray'},
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
            GM_registerMenuCommand("Stop forcing Coppersmina in current site", disableRunAlways, 'C');
        } else {
            GM_registerMenuCommand("Force Coppersmina in current site", enableRunAlways, 'C');
        }

        if(autoDisableRunAlways) {
            //If runAlways is enabled by more than 24 hours disable automatically
            //because it's probably been forgotten enabled
            var timeEnabled = GM_getValue("timeRunAlwaysEnabled");
            var timeNow = new Date(2014, 6, 27);
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
        if(anchors.length === 0) { return; }
        for(var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];
            var thumbnail = anchor.querySelector('img');
            if(thumbnail === null) { continue; }
            //find the text field under the thumbnail
            var caption = anchor.parentNode.querySelector("span");
            //add the old link to the caption
            var oldLink = document.createElement('a');
            oldLink.innerHTML = "Original link";
            oldLink.href = anchor.href;
            caption.appendChild(document.createElement('br'));
            caption.appendChild(oldLink);
            //replace the thumbnail link with a direct link to the HD image
            var hdUrl = thumbnail.src.replace(/thumb_/, "");
            anchors[i].href = hdUrl;
            //Copy image information from title attribute and append to caption
            var regex, found;
            for(var j = 0; j < imageInfo.length; j++) {
                regex = new RegExp(imageInfo[j] + '=(.*)');
                found = regex.exec(thumbnail.title);
                if(found !== null) {
                    var extraInfo = document.createElement('span');
                    extraInfo.innerHTML = found[1];
                    caption.appendChild(document.createElement('br'));
                    caption.appendChild(extraInfo);
                }
            }

            if(colorBorder) {
                //Calculate image weight to chose a border color
                var imageWeight;
                regex = new RegExp(colorByWhat + '=(.*)');
                found = regex.exec(thumbnail.title);
                if(colorByWhat == "Dimensions") {
                    var sizes = found[1].split('x');
                    var area = sizes[0] * sizes[1];
                    //Divide to have comparable sizes with "FileSize" wich is expressed in KB
                    imageWeight = area / 8192;
                } else {
                    //Remove last 3 characters occupied by "KiB"
                    imageWeight = found[1].slice(0, -3);
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
        runCoppersmina();
    }
}());

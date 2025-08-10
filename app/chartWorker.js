let downsampler = require("downsample-lttb");
const zip = (a, b) => a.map((k, i) => [k, b[i]]);


let staticX = Array.from({ length: 86400 }, (_, index) => index + 1)
let temp = new Array(86_400).fill(0)
let press = new Array(86_400).fill(0)
let minVal = {"temp": 0, "press": 0}
let maxVal = {"temp": 0, "press": 0}
let realMinVal = 0
let realMaxVal = 0

onmessage = (e) => 
{
    temp.push(e.data["temp"]);
    temp.shift()
    press.push(e.data["press"]);
    press.shift()

    tempZip = zip(staticX, temp)
    pressZip = zip(staticX, press)

    let tab = {"temp":null, "press":null, "min":null, "max":null}
    console.log(e.data)
    switch(e.data["mode"])
    {
        case '5min':
            tab["temp"] = tempZip.slice(-300).map((e) => e[1]);
            tab["press"] = pressZip.slice(-300).map((e) => e[1]);
            break;
        case '1h':
            tab["temp"] = downsampler.processData(tempZip.slice(-3600), 600).map((e) => e[1]);
            tab["press"] = downsampler.processData(pressZip.slice(-3600), 600).map((e) => e[1]);
            break;
        case '6h':
            tab["temp"] = downsampler.processData(tempZip.slice(-21600), 600).map((e) => e[1]);
            tab["press"] = downsampler.processData(pressZip.slice(-21600), 600).map((e) => e[1]);
            break
        case '12h':
            tab["temp"] = downsampler.processData(tempZip.slice(-43200), 600).map((e) => e[1]);
            tab["press"] = downsampler.processData(pressZip.slice(-43200), 600).map((e) => e[1]);
            break;
        case '24h':
            tab["temp"] = downsampler.processData(tempZip, 600).map((e) => e[1]);
            tab["press"] = downsampler.processData(pressZip, 600).map((e) => e[1]);
            break;
    }

    minVal["temp"] = Math.min(...tab["temp"])
    maxVal["temp"] = Math.max(...tab["temp"])
    minVal["press"] = Math.min(...tab["press"])
    maxVal["press"] = Math.max(...tab["press"])

    if(e.data["chartMode"] == 'press')
    {
        realMinVal = minVal["press"]
        realMaxVal = maxVal["press"]
        console.log('only press')
    }
    if(e.data["chartMode"] == 'temp')
    {
        realMinVal = minVal["temp"]
        realMaxVal = maxVal["temp"]
        console.log('only temp')
    }
    if(e.data["chartMode"] == 'both')
    {
        realMinVal = Math.min(minVal["temp"], minVal["press"])
        realMaxVal = Math.max(maxVal["temp"], maxVal["press"])
        console.log('both')
    }

    tab["min"] = realMinVal - realMinVal * 0.2
    tab["max"] = realMaxVal + realMaxVal * 0.2
    postMessage(tab)
};
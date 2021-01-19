var mqtt = require('mqtt');
var fs = require('fs')

const readline = require('readline');
const sl = require("serverline")

var ip;
var p;
var keyFile;
var keyFilePath;
var certFile;
var certFilePath;
var caFile;
var caFilePath;
var subChannel;
var pubChannel;
var log = true;

var ipDefault = "192.168.1.109"
var portDefault = "8883"
var keyFileDefault = "./certs/user1.key"
var certFileDefault = "./certs/user1.crt"
var caFileDefault = "./certs/ca.crt"
var subChannelDefault = "test"
var pubChannelDefault = "test"

main();

async function main(){
    console.clear()
    ip = await askQuestion(`Enter the IP or FQDN of the Mosquitto Server \x1b[4m(${ipDefault})\n\x1b[0m> `)
    if (ip == ""){
        ip = ipDefault
    }

    console.clear()
    p = await askQuestion(`Enter the port for the Mosquitto Server \x1b[4m(${portDefault})\n\x1b[0m> `)
    if (p == ""){
        p = portDefault
    }

    console.clear()
    keyFilePath = await askQuestion(`Enter the file path to your key file. \x1b[4m(${keyFileDefault})\n\x1b[0m> `)
    if (keyFilePath == ""){
        keyFilePath = keyFileDefault
    }
    try {
        keyFile = fs.readFileSync(keyFilePath, 'utf8')
        console.log(data)
    } catch (err) {
        console.error(err)
    }

    console.clear()
    certFilePath = await askQuestion(`Enter the file path to your certificate file. \x1b[4m(${certFileDefault})\n\x1b[0m> `)
    if (certFilePath == ""){
        certFilePath = certFileDefault
    }
    try {
        certFile = fs.readFileSync(certFilePath, 'utf8')
        console.log(data)
    } catch (err) {
        console.error(err)
    }

    console.clear()
    caFilePath = await askQuestion(`Enter the file path to your certificate authority file. \x1b[4m(${caFileDefault})\n\x1b[0m> `)
    if (caFilePath == ""){
        caFilePath = caFileDefault
    }
    try {
        caFile = fs.readFileSync(caFilePath, 'utf8')
        console.log(data)
    } catch (err) {
        console.error(err)
    }

    console.clear()
    subChannel = await askQuestion(`Which channel would you like to subscribe to? \x1b[4m(${subChannelDefault})\n\x1b[0m> `)
    if (subChannel == ""){
        subChannel = subChannelDefault
    }

    console.clear()
    pubChannel = await askQuestion(`Which channel would you like to publish to? \x1b[4m(${pubChannelDefault})\n\x1b[0m> `)
    if (pubChannel == ""){
        pubChannel = pubChannelDefault
    }

    console.clear()
    console.log(`\x1b[0mConnected to \x1b[35m${ip + "\x1b[37m:\x1b[32m" + p}`)
    console.log(`\x1b[0m\nKey File: \x1b[4m${caFilePath}`)
    console.log(`\x1b[0mCertificate File: \x1b[4m${caFilePath}`)
    console.log(`\x1b[0mCertificate Authority File: \x1b[4m${caFilePath}`)
    console.log(`\n\x1b[0m\x1b[34mSubscribed to ${subChannel}`)
    console.log(`\x1b[33mPublishing to ${pubChannel}`)
    console.log(`\n\x1b[0mType message to send or close to \x1b[31mclose\n\x1b[33m`)
    connect();
}

function connect(){

    var options = {
        port: p,
        host: ip,
        key: keyFile,
        cert: certFile,
        rejectUnauthorized: true,
        ca: caFile,
        protocol: 'mqtts'
    }

    var client = mqtt.connect(options)

    client.on('connect', function () {
        client.subscribe(subChannel, function (err) {
            if (err) {
                console.log(err)
                client.end()
            }
        })
    })
    
    client.on('message', function (topic, message) {
        if(log == true){
            console.log("\x1b[34m> "+message.toString()+"\x1b[33m")
        }
    })

    sl.init()

    sl.on('line', function(line) {
        if (line == "close"){
            console.log("\x1b[0m")
            sl.close()
            process.exit()
        }
        client.publish(pubChannel, line)
        log = false;
        setTimeout(function () {
            log = true
        }, 10)
    })
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

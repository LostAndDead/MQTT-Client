/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

//We require the mqtt library and file system
var mqtt = require('mqtt');
var fs = require('fs')
//We also nedd readline for taking input and serverline for a pretiier input console
const readline = require('readline');
const sl = require("serverline")

//A lot of global varibles declared
var ip;
var p;
var tls;
var keyFile;
var keyFilePath;
var certFile;
var certFilePath;
var caFile;
var caFilePath;
var subChannel;
var pubChannel;
var log = true;

//And some default values if the user doesnt enter them
var ipDefault = "192.168.1.109"
var portDefault = "8883"
var tlsDefault = true
var keyFileDefault = "./certs/user1.key"
var certFileDefault = "./certs/user1.crt"
var caFileDefault = "./certs/ca.crt"
var subChannelDefault = "test"
var pubChannelDefault = "test"

//Call the main loop
main();

async function main(){
    /*
    All of these are very simular we just clear the console for a nice look 
    then we ask the user to setup the value, if they dont give anything we assume
    default value and move on to the next question
    */
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
    tls = await askQuestion(`Do you want to use TLS? \x1b[4m(${tlsDefault})\n\x1b[0m> `)
    if (tls == ""){
        tls = tlsDefault
    }else if(tls.toLowerCase() == "true" || tls.toLowerCase() == "yes" || tls.toLowerCase() == "y"){
        tls = true
    }else {
        tls = false
    }

    /*
    These options are only asked for if the user wants to use tls,
    if they dont we skip past
    */
    if(tls){
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

    /*
    We give the user a bit of info about what they connected to and 
    what authentication they are using (if they are using any)
    */
    console.clear()
    console.log(`\x1b[0mConnected to \x1b[35m${ip + "\x1b[37m:\x1b[32m" + p}`)
    if(tls){
        console.log(`\x1b[0m\nKey File: \x1b[4m${keyFilePath}`)
        console.log(`\x1b[0mCertificate File: \x1b[4m${certFilePath}`)
        console.log(`\x1b[0mCertificate Authority File: \x1b[4m${caFilePath}`)
    }
    console.log(`\n\x1b[0m\x1b[34mSubscribed to ${subChannel}`)
    console.log(`\x1b[33mPublishing to ${pubChannel}`)
    console.log(`\n\x1b[0mType message to send or close to \x1b[31mclose\n\x1b[33m`)

    //Then we run the connect object to establish a connection to the mqtt server
    connect();
}

function connect(){

    /*
    we define 2 different object values depending on wether
    the user is using tls or not
    */
    var options
    if(tls){
        options = {
            port: p,
            host: ip,
            key: keyFile,
            cert: certFile,
            rejectUnauthorized: true,
            ca: caFile,
            username: "node1",
            protocol: "mqtts",
            /* 
            Ignore these for now im testing modifications to packets and 
            authentication but it wont do anything for you as its a edited
            npm module that handles it.
            */
            clientId: "node1-id",
            randomValue: "bob"
        }
    }else{
        options = {
            port: p,
            host: ip,
            rejectUnauthorized: true,
            protocol: "mqtt"
        }
    }

    //We simply connect if there is an authentication error it should be thrown here
    var client = mqtt.connect(options)

    //We define what hands once we have successfully connected 
    client.on('connect', function () {
        /*We just subscribe to the channel the user wants 
        and if there is an error we throw it and close
        */
        client.subscribe(subChannel, function (err) {
            if (err) {
                console.log(err)
                client.end()
            }
        })
    })
    
    /*
    When we get a messagewe just log it to the console window
    */
    client.on('message', function (topic, message, packet) {
        /*
        This log value is just weather we actualy want to show the user the message 
        Its here becuase just after we send a message it loops back to us as an incoming message,
        this simply stops that
        */
        if(log == true){
            console.log("\x1b[34m> "+message.toString()+"\x1b[33m")
            //Debugging packets
            //console.log(packet)
        }
    })

    //We create the server line instance
    sl.init()

    /*
    Server line is great as it makes the input line always at the bottom
    we use this just to make it prettier and stopping the input being 
    above output
    */
    sl.on('line', function(line) {
        //If they say close we just close the connection and exit the program
        if (line == "close"){
            console.log("\x1b[0m")
            sl.close()
            process.exit()
        }
        //Actualy publish the message the user wants to send
        client.publish(pubChannel, line)
        //Stop feed back for 10ms
        log = false;
        setTimeout(function () {
            log = true
        }, 10)
    })
}

//Just handles answering questions to the user for easy repetition and re-use
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

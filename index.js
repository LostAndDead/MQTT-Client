var mqtt = require('mqtt');

const readline = require('readline');
const sl = require("serverline")

var ip;
var subChannel;
var pubChannel;
var log = true;

var ipDefault = "192.168.1.109"
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
    console.log(`\x1b[34mSubscribed to ${subChannel}\n\x1b[33mPublishing to ${pubChannel}\n\x1b[0mType message to send or close to \x1b[31mclose\n\x1b[33m`)
    connect();
}

function connect(){

    var client = mqtt.connect(`mqtt://${ip}`)

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

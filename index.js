var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var mqtt = require('mqtt');

// Your Channel access token (long-lived) 
const CH_ACCESS_TOKEN = 'FkHfNBLucH7f2lSbaCxpgXu9XIhgoXbmrTxI8hPAz/5+KEkfS9aHaFycs97I+DEJAynf+QmT3iYGvfvJSs3utXeYxAAlG8w9jJlDTBkGcjtFmmqeAXJgiqFQ39s3qVSanG4MXhuGrbCXHXxZHy0h3gdB04t89/1O/w1cDnyilFU=';

// MQTT Host
var mqtt_host = 'mqtt://203.159.93.171';

// MQTT Topic
var mqtt_topic = '/LINEDIYA';

// MQTT Config
var options = {
    port: 1883,
    host: 'mqtt://203.159.93.171',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'mqtt_smartfarm',
    password: 'mqtt0910690204',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};


app.use(bodyParser.json())

app.set('port', (process.env.PORT || 3000))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

var client = mqtt.connect(mqtt_host, options);
client.on('connect', function () {
    console.log('MQTT connected');
    client.subscribe(mqtt_topic, function () {
        client.on('message', function (topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
            if (topic === mqtt_topic) {

                let json = JSON.stringify(message.toString('utf8'));
                // let datas = JSON.parse(json);

                let sender = json.substring(json.indexOf(" ") + 2, json.indexOf(",") - 1);
                let mes = json.substring(json.indexOf('text') + 13, json.indexOf("}") - 1);

                let data2 = {
                    to: sender,
                    messages: [
                        {
                            type: 'text',
                            text: mes
                        }
                    ],
                }

                request({
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + CH_ACCESS_TOKEN + ''
                    },
                    url: 'https://api.line.me/v2/bot/message/push',
                    method: 'POST',
                    body: data2,
                    json: true
                }, function (err, res, body) {
                    if (err) console.log('error')
                    if (res) console.log('success')
                    if (body) console.log(body)
                })
            }


        });
    });
});

app.post('/webhook', (req, res) => {
    var text = req.body.events[0].message.text.toLowerCase()
    var sender = req.body.events[0].source.userId
    var replyToken = req.body.events[0].replyToken
    console.log(text, sender, replyToken)
    console.log(typeof sender, typeof text)
    // console.log(req.body.events[0])

    if (text === 'ฝุ่น') {
        func_PM(sender, text)
    }
    if (text === 'ความชื้น') {
        func_Hum(sender, text)
    }
    if (text === 'อากาศ') {
        func_Temp(sender, text)
    }
    if (text === 'ทั้งหมด') {
        func_All(sender, text)
    }

    // ฝุ่น ความชื้น อากาศ ทั้งหมด

    res.sendStatus(200)
})

function func_PM(sender, text) {
    console.log("sender = " + sender);
    var data = {
        to: sender,
        messages: 'pm'
    }
    console.log(data);
    client.publish(mqtt_topic, JSON.stringify(data));

}

function func_Hum(sender, text) {
    console.log("sender = " + sender);
    var data = {
        to: sender,
        messages: 'hum'
    }
    console.log(data);
    client.publish(mqtt_topic, JSON.stringify(data));
}

function func_Temp(sender, text) {
    console.log("sender = " + sender);
    var data = {
        to: sender,
        messages: 'temp'
    }
    console.log(data);
    client.publish(mqtt_topic, JSON.stringify(data));
}

function func_All(sender, text) {
    console.log("sender = " + sender);
    var data = {
        to: sender,
        messages: 'all'
    }
    console.log(data);
    client.publish(mqtt_topic, JSON.stringify(data));
}

app.listen(app.get('port'), function () {
    console.log('run at port', app.get('port'))
})

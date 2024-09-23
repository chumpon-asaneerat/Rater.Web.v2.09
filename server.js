const express = require('express')
const morgan = require('morgan')
// Note: Express 4.16+ you don't have to import body-parser anymore
//const bodyparser = require('body-parser')
const cookieparser = require('cookie-parser')

const fetch = require('node-fetch')
const AbortController = require('abort-controller')

//const https = require('https')

let app = express()
let port = 3000

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// Note: Express 4.16+ you don't have to import body-parser anymore You can do it just like this:
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// If used older version of Express. bodyparser required so uncomment below line
//app.use(bodyparser.urlencoded({ extended: true }));
//app.use(bodyparser.json());

app.use(cookieparser());


app.all('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/users', (req, res) => {
    res.send('Hello World! This is user url')
})

app.all('/execute', (req, res) => {
    req.setTimeout(5 * 1000) // timeout in 5 second
    let data = req.method == "POST" ? req.body :  Object.fromEntries(new URLSearchParams(req.query))
    if (!data) 
        data = { timeout: 1000 };
    setTimeout(() => {
        console.log("response to caller.")
        let output = { 
            message: 'Hello World!' 
        }
        res.send(output)
    }, data.timeout);
})

const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

app.post('/check', (req, res) => {
    let request = async () => 
    {
        const controller = new AbortController();
        const signal = controller.signal

        signal.addEventListener("abort", () => {
            console.log("aborted!")
        })

        const timeout = setTimeout(() => {
            console.log('abort timeout 1 s.')
            controller.abort()
        }, 1000);

        let url = 'http://localhost:3000/execute';
        let pObj = req.body
        let sJson = JSON.stringify(pObj)
        let agent = null
        let options = { 
            method: 'POST',
            body: sJson,
            agent: agent,
            headers: {
                'Content-Type': 'application/json',
                'enabled': 'true',
                'Accept': 'application/json'
            },
            signal: signal
        }

        try 
        {
            const response = await fetch(url, options)

            var ret = await response
            if (ret) {
                const data = ret.json()
                console.info(data)
            }
            else {
                // no response
                console.info('No response')
            }
        }
        catch (err) {
            if (err.name === 'AbortError') {
                console.log('request was aborted');
            }
            else if (err.name === 'FetchError') {
                console.log('fetch error');
            }
            else {
                console.error(err)
            }
        }
        finally {
            console.info('clear timeout')
            clearTimeout(timeout)
        }
    } 

    request() // call api
})
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


/*

We can implement the basic authorization without needing any module
source: https://www.dotnetcurry.com/nodejs/1231/basic-authentication-using-nodejs
//1.
var http = require('http');

//2.
var credentials = {
    userName: "vikas kohli",
    password: "vikas123"
};
var realm = 'Basic Authentication';

//3.
function authenticationStatus(resp) {
    resp.writeHead(401, { 'WWW-Authenticate': 'Basic realm="' + realm + '"' });
    resp.end('Authorization is needed');

};

//4.
var server = http.createServer(function (request, response) {
    var authentication, loginInfo;

    //5.
    if (!request.headers.authorization) {
        authenticationStatus (response);
        return;
    }

    //6.
    authentication = request.headers.authorization.replace(/^Basic/, '');

    //7.
    authentication = (new Buffer(authentication, 'base64')).toString('utf8');

    //8.
    loginInfo = authentication.split(':');

    //9.
    if (loginInfo[0] === credentials.userName && loginInfo[1] === credentials.password) {
        response.end('Great You are Authenticated...');
         // now you call url by commenting the above line and pass the next() function
    }else{

    authenticationStatus (response);

}

});
 server.listen(5050);


*/
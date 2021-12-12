var snmp = require ("net-snmp");
const express = require('express')
const app = express()
const port = 3000

var options = {
    timeout: 500,
}

// Example user
var user = {
    name: "christmas",
    level: snmp.SecurityLevel.authPriv,
    authProtocol: snmp.AuthProtocols.md5,
    authKey: "ydmRk44Cv7cqXf9ZFcuhE",
    privProtocol: snmp.PrivProtocols.des,
    privKey: "OPOalR9K7h2zF5H2s0nQy"
};

var session = snmp.createV3Session ("192.168.176.128", user, options);

var oids = ["1.3.6.1.4.1.318.1.1.4.4.2.1.3.1"];

app.get('/', (req, res) => {
    session.get (oids, function (error, varbinds) {
        if (error) {
            console.error (error);
        } else {
            for (var i = 0; i < varbinds.length; i++) {
                if (snmp.isVarbindError (varbinds[i])) {
                    console.error (snmp.varbindError (varbinds[i]));
                } else {
                    res.send(varbinds[i].oid + " = " + varbinds[i].value)
                    console.log (varbinds[i].oid + " = " + varbinds[i].value);
                }
            }
        }
    });
})

app.get('/randomon', (req, res) => {
      randomTreeOn(res);
})

app.get('/randomoff', (req, res) => {
    randomTreeOff(res);
})

app.get('/random', (req, res) => {
    //for loop 100

    treeOn(1);
    treeOn(2);
    treeOn(3);
    treeOn(4);

    setInterval(function(){ 
        randomTreeOff();
        randomTreeOn();
    }, 2500);

})

app.get('/randomflash', (req, res) => {
    //for loop 100

    setInterval(function(){ 
        randomTreeOn();
        randomTreeOff();
    }, 2500);

})

app.get('/loop', (req, res) => {
    //for loop 100

    onTrees.push(1);

    let lastTree = 1;
    let reverse = false;

    setInterval(function(){ 

        if(reverse) {
            newTree = lastTree - 1;
        } else {
            newTree = lastTree + 1;
        }

        if(newTree > 8 || newTree < 1) {
            reverse = !reverse;
        }

        if(newTree > 8) {
            newTree = 7;
        }

        if(newTree < 1) {
            newTree = 2;
        }

        treeOn(newTree);
        treeOff(lastTree);

        lastTree = newTree;
    }, 3000);

})
  
app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
})


let onTrees = [];


function randomTreeOn(res) {

    //Generate a random number between 1 and 8 that is not in onTrees array
    let rand = 0;

    //check if all the trees are on
    if(onTrees.length == 8) {
        if(res != null) {
            res.send("All trees are on");
        }
        return;
    } 

    do {
        rand = Math.floor(Math.random() * 8) + 1;
    } while (onTrees.includes(rand));


    treeOn(rand, res);
    
}

function treeOn(tree, res) {
    onTrees.push(tree);

    var varbinds = [
        {
            oid: "1.3.6.1.4.1.318.1.1.4.4.2.1.3." + parseInt(tree),
            type: snmp.ObjectType.Integer,
            value: 1
        }
    ];

    sendRequest(varbinds, res);
}
    
function randomTreeOff(res) {
    let rand = 0;

    if(onTrees.length == 0) {
        if(res != null) {
            res.send("All trees are off");
        }
        return;
    }

    rand = Math.floor(Math.random() * onTrees.length) + 1;
    let tree = onTrees[rand - 1];

    treeOff(tree, res);

}

function treeOff(tree, res) {
    var varbinds = [
        {
            oid: "1.3.6.1.4.1.318.1.1.4.4.2.1.3." + parseInt(tree),
            type: snmp.ObjectType.Integer,
            value: 2
        }
    ];

    sendRequest(varbinds, res);

    onTrees.splice(onTrees.indexOf(tree), 1);
}

function sendRequest(varbinds, res) {
    session.set (varbinds, function (error, varbinds) {
        if (error) {
            console.error (error.toString ());
            if(res != null) {
                res.send(error.toString ());
            }
        } else {
            for (var i = 0; i < varbinds.length; i++) {
                // for version 1 we can assume all OIDs were successful
                console.log (varbinds[i].oid + "|" + varbinds[i].value);
            
                // for version 2c we must check each OID for an error condition
                if (snmp.isVarbindError (varbinds[i])) {
                    console.error (snmp.varbindError (varbinds[i]));
                    if(res != null) {
                        res.send(varbinds[i].oid + " = " + varbinds[i].value);
                    }
                } else {
                    console.log (varbinds[i].oid + "|" + varbinds[i].value);
                    if(res != null) {
                        res.send(varbinds[i].oid + " = " + varbinds[i].value);
                    }
                }
            }
        }
    });
}

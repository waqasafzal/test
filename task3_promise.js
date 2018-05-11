var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var async = require("async");
var app = express();

function validate_url(url){
    
    let substring = ".com" 
    let isValidString = url.includes(substring);
    if(!isValidString)
        return false;
    substring = "https://";
    let check_HTTP_protocol = url.includes(substring);
    if(!check_HTTP_protocol)
       url = 'https://'+url;
    return url;
}

function getData(query){
    
    return new Promise(function(resolve, reject) {

        let is_array = Array.isArray(query);
        let links_arr = [];
        if(is_array)
        {   
            query.forEach(function(url) {
                let results = validate_url(url);
                if(results)
                    links_arr.push(results);
                else
                    reject("Required data has not been parsed properly.");

            });
        }
        else
        {
            let results = validate_url(query);
            if(results)
                links_arr.push(results);
            else
                reject("Required data has not been parsed properly.");

        }
        if(Array.isArray(links_arr))
            resolve(links_arr);
            

       
    });

}

function get_title(links_arr)
{

    let length = links_arr.length;
    let titles_arr = {};
    
    return new Promise(function(resolve, reject) {
        
        links_arr.forEach(function(url) {
               
            request(url, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var $ = cheerio.load(body);
                    
                    let title = $("head > title").text().trim();
                    titles_arr[url] = title;
                    
                    
                }
                else
                    titles_arr[url] = "not Found";
                
                let size = Object.keys(titles_arr).length;
                if(size == length)
                    resolve(titles_arr);
                
            });

        });
    });

}

function send_response(arr)
{
    return new Promise(function(resolve, reject) {

                    
        let size = Object.keys(arr).length;
        if(size>=1)
        {
              
            let final_res ='<h1> Following are the titles of given websites: </h1> <br>';
            final_res += '<ul>';
            for (var key in arr) {
                    if (arr.hasOwnProperty(key)) {
                        final_res += '<li> <b>' + key +' -- ' + arr[key] +'</b> </li>';
                    }
                }
            final_res +='</ul>';
            resolve(final_res);
        }
        else
            reject("Required data has not been parsed properly.");
            
    });
}


app.get('/', function (req, res) {
  res.send('Welcome to Server!');
});

app.get('/I/want/title/', function(req, res){

    let query = req.query.name;
    if(query!=undefined)
    {
        let get_query_details = getData(query).then(function(result) 
        {
            let getTitle = get_title(result).then(function (data)
            {
                let sendResponse = send_response(data).then(function (result)
                {
                    return res.send(result);
                   
                }, function(err) {
                    return res.send(err);
                });

               
            }, function(err) {
                return res.send(err);
            });
                
        }, function(err) {
            return res.send(err);
        });
        
    }
    else
        return res.send("You didn't enter any link.");


});


app.get('*', function(req, res){
  res.send("Sorry! Unable to find that Page", 404);
});

app.listen(3000, function () {
  console.log('app listening on port 3000!');
});




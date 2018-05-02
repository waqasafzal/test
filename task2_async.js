var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var async = require("async");
var app = express();


app.get('/', function (req, res) {
  res.send('Welcome to Server!');
});

app.get('/I/want/title/', function(req, res){

	var links_arr = [];
	var titles_arr = [];



	function validate_url(url){
		
		let substring = ".com" 
	    let isValidString = url.includes(substring);
	    if(!isValidString)
	        return res.send("invalid address has been parsed.", 400);
		substring = "https://";
	    let check_HTTP_protocol = url.includes(substring);
		if(!check_HTTP_protocol)
	       url = 'https://'+url;
	    return url;
	}


	async.waterfall([
	    function get_data(callback) 
	    {
	        let query = req.query.name;
			let is_array = Array.isArray(query);
	    	if(is_array)
		    {   
		        query.forEach(function(url) {
		            let results = validate_url(url);
			        links_arr.push(results);
				});
		    }
		    else
		    {
		    	let results = validate_url(query);
		    	links_arr.push(results);
		    }
			callback(null, links_arr);
		},
	    function get_title(links_arr,callback)
	    {

	    	let length = links_arr.length;
	    	
	    	links_arr.forEach(function(url) {
		    	       
				request(url, function (error, response, body) {
		            if (!error && response.statusCode === 200) {
		                var $ = cheerio.load(body);
		                
		                let title = $("head > title").text().trim();
		                titles_arr.push(title);
						if(titles_arr.length == length)
							callback(null, titles_arr);  
					}
					else 
		                console.log(`Error = ${error}, code = ${response.statusCode}`);
		            
				});

			});
		},
	    function final_response(titles_arr,callback)
	    {
			let html_data='';
	    	if(titles_arr.length==1)
	    		return res.send('<b>'+titles_arr[0]+'</b>');
	    	
	    	else
	    	{
	    		titles_arr.forEach(function(value,index) {	
					html_data += '<li> <b>' + links_arr[index] +' -- ' + value +'</b> </li>';
					
				});	
				return res.send(html_data);
	    	}
	    }
	],function(err, results) {
	    console.log(results);
	});
});


app.get('*', function(req, res){
  res.send("Sorry! Unable to find that Page", 404);
});

app.listen(3000, function () {
  console.log('app listening on port 3000!');
});




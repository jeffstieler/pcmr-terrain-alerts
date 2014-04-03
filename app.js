var	request = require("request"),
	cheerio = require("cheerio"),
	Prowl = require("node-prowl"),
	prowl = new Prowl(process.env.PROWL_API_KEY || ""),
	snowReportURL = "http://www.parkcitymountain.com/site/mountain-info/conditions/snow-report/snow_report",
	terrainAlerts = ["Pinecone Lower", "Pinecone Upper", "Pioneer Ridge"];

function checkBowlStatus(err, response, html) {
	if ( err ) {
		return console.error(err);
	}
	var $ = cheerio.load(html);
	var bowls = {};
	$("#section-bowls tr.odd, #section-bowls tr.even").each(function(i, tr) {
		var	$bowl = $(tr),
			name = $bowl.find("th.name").text(),
			open = !!$bowl.find("td.status > span.run-status-open-icon").length;
		bowls[name] = open;
	});
	terrainAlerts.forEach(function(terrain) {
		bowls[terrain] && sendTerrainAlert(terrain);
	});
}

function sendTerrainAlert(terrain) {

	var message = terrain + " is open! " + terrain + " is open! " + terrain + " is open!";

	prowl.push(
		message,
		'PCMR',
		{
	    	priority: 2
		},
		function(err, remaining) {
	    	if ( err ) {
	    		console.log(err);
	    	} else {
		    	console.log( "Message sent. " + remaining + " API calls remaining this hour." );
		    }
		}
	);

}

request(snowReportURL, checkBowlStatus);


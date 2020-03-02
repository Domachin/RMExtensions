var identified_artifacts = ["Condizione applicativa","Contromisura","Hazard","Requisito cliente","Requisito sistema","Requisito software","Requisito sottosistema","Test"];
var identifiers = ["Identificativo Condizione Applicativa","Identificativo Contromisura","Identificativo Hazard","Identificativo UN","Identificativo ERIS","Identificativo Software","Identificativo Sottosistema","Identificativo Test"];
var prefixes = ["xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_"];
var counters = [1,1,1,1,1,1,1,1];
var initialize = true;

function updateCounters()
{
	window.alert("initialization 22");
	//RM.Data.getAttributes(RM.Data, function(result){
	//	for (var i = 0; i < 8; i++)
	//	{
	//	}
	initialize=false;
}

$(function()
{
	if (initialize==true) updateCounters();
	
	var selection = [];
	RM.Event.subscribe(RM.Event.ARTIFACT_SELECTED, function(selected) {
	selection = selected;
	});
			   
	window.alert(selection.length);
	
  $("#SetID").on("click", function() {
	  
      window.alert("start function");
      RM.Data.getAttributes(selection, identifiers.concat([RM.Data.Attributes.ARTIFACT_TYPE]), function(result){
      
      // Store any required attribute changes here
      var toSave = [];
      window.alert("get attributes");
       // Go through artifact data examining artifact type
      result.data.forEach(function(item){
         var type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
         window.alert(type);
         var newid = "";
	 var n = -1;
	 for (var i = 0; i < 8; i++)
	 {
		 //window.alert(identified_artifacts[i]+" vs "+type);
		 if(identified_artifacts[i].includes(type)) {n=i; window.alert("found: "+i);}
	 }
	 /*if(counters[i]==1)
	 {
		 var maximum = 1;
		 RM.Data.getAttributes(selection, identifiers, function(result3){
			 result3.data.forEach(function(item2){
			 	var oldid = item2.values[identifiers[i]];
				var num = Number(oldid.split(prefixes[i])[1]);
				if (num>maximum) maximum=num;
				if(isNaN(num)) window.alert("Number error");
			});
		 });
	 }*/
	 if(n!=-1)
	 {
	    //newid = prefixes[n]+('000'+counters[n]).slice(-3);
	    //counters[n]++;
            //item.values[identifiers[n]] = newid;
            //toSave.push(item);
	 }
      });
      
      // Perform a bulk save for all changed attributes
      RM.Data.setAttributes(toSave, function(result2){
         if(result2.code !== RM.OperationResult.OPERATION_OK)
         {
            window.alert("Error: " + code);
         }
      });
   });
});
});







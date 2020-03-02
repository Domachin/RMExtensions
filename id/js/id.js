var identified_artifacts = ["Condizione applicativa","Contromisura","Hazard","Requisito cliente","Requisito sistema","Requisito software","Requisito sottosistema","Test"];
var identifiers = ["Identificativo Condizione Applicativa","Identificativo Contromisura","Identificativo Hazard","Identificativo UN","Identificativo ERIS","Identificativo Software","Identificativo Sottosistema","Identificativo Test"];
var prefixes = ["xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_"];
var initialize = true;

function updateCounters()
{
	window.alert("initialization 39");
	initialize=false;
}

$(function()
{
	if (initialize==true) updateCounters();
	
	var selection = [];
	RM.Event.subscribe(RM.Event.ARTIFACT_OPENED, function(selected) {
	selection = selected;
	});
	
  $("#SetID").on("click", function() {
	  
      
      window.alert("start function");
	  
      RM.Data.getContentsAttributes(selection, identifiers.concat([RM.Data.Attributes.ARTIFACT_TYPE]), function(result){
	      
      if(result.code !== RM.OperationResult.OPERATION_OK)
      {
         return;
      }
	      
      var counters = [1,1,1,1,1,1,1,1];
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
	 if(n!=-1)
	 {
	    if(counters[n]==1)
	    {
		 window.alert("counter! "+counters[n]);
		 var maximum = 1;
		 RM.Data.getContentsAttributes(selection, identifiers, function(result3){
			 result3.data.forEach(function(item2){
			 	var oldid = item2.values[identifiers[n]];
				var num = 0;
				if(oldid.includes(prefixes[n])) num=Number(oldid.split(prefixes[n])[1]);
				window.alert("counter "+counters[n]+" num "+num);
				if (num>maximum) maximum=num;
				if(isNaN(num)) window.alert("Number error");
			});
		 });
		 counters[n]=maximum;
	    }
		 
            if (item.values[identifiers[n]]==null || !(item.values[identifiers[n]].includes(prefixes[n])))
	    {
		newid = prefixes[n]+('000'+counters[n]).slice(-3);
	    	window.alert(newid);
	    	item.values[identifiers[n]] = newid;
		counters[n]++;
            	toSave.push(item);
	    }
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







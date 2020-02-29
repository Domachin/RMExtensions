
//"use strict";

var Script_Version = "(ver 3.0)"

//console.log(Script_Version)

// data model attributes
var Attr_PJcode = "Project Number";
var Attr_SolutionCode = "SESAR Solution";
var Attr_Prefix = "Prefix"
var Attr_Increment = "Increment"
var Attr_Padding = "Padding"
var Attr_Separator = "Separator"
var Attr_Counter = "Counter"
var Attr_PUID = "PUID"
var Art_Type = undefined;
var Window_Height = 200

// list of artefact types with a PUID attribute
var List_PUID_Types = [ "Requisito software", "Requisito cliente", "Requisito sistema" ]

// PUID application
function checkType(t)
{
	if (t.toLowerCase().match(/requirement/))
	{
		return true;
	}
	
	var i
	for (i=0;i<List_PUID_Types.length;i++)
	{
		if (t == List_PUID_Types[i])
			return true;
	}
	return false;
}

// variables

var Mod_Ref = undefined;
var Mod_Prefix = undefined;
var Mod_Increment = undefined;
var Mod_Padding = undefined;
var Mod_Separator = undefined;
var Mod_Counter = undefined;
var Art_Ref = undefined;
var Art_ID = undefined;
var Art_PUID = undefined;
// var Mod_PJcode = undefined;
// var Mod_SolutionCode = undefined;
var Last_Log = undefined;

function logm(s)
{
	var p = document.createElement("div");
	p.textContent = s;
	if (Last_Log == undefined)
		document.getElementById("log").appendChild(p);
	else
		document.getElementById("log").insertBefore(p,Last_Log.nextSibling);
	Last_Log = p;
}


function clearLog()
{
	var log = document.getElementById("log");
	var e;
	while (e = log.lastChild) log.removeChild(e);
	$("log").empty();
	Last_Log = undefined;
}

function computePUID()
{
	var s = Mod_Counter.toString();
    while (s.length < Mod_Padding)
    {
    	s = "0" + s
    }
	// var id = Mod_Prefix + Mod_Separator + s;
	var id = undefined;
	var idPrefix = undefined;
	// Mod_PJcode=PJ15;
	// Mod_SolutionCode="01";
	if (Art_Type == "Requisito software")
		idPrefix = "REQ" +  Mod_Separator + "UR";
	else if (Art_Type == "Requisito cliente")
                idPrefix = "REQ" +  Mod_Separator + "SSS"; 
	else if (Art_Type == "Requisito sistema")
                idPrefix = "REQ" +  Mod_Separator + "INT";
	else
		idPrefix="UNDEF";
	//console.log(id);

		id = idPrefix + Mod_Separator + s;
	return id;
}

function genPUID()
{
    if (Mod_Ref != undefined && Art_Ref != undefined && Art_PUID == undefined)
    {
        var new_puid = computePUID()
 	var val = new RM.ArtifactAttributes(Art_Ref);

	if(Art_Type == "Requisito software" || Art_Type == "Requisito cliente" || Art_Type == "Requisito sistema")
		Attr_PUID="Requirement Identifier";

        val.values[Attr_PUID] = new_puid;
        RM.Data.setAttributes(val, function(res)
        {
            if (res.code === RM.OperationResult.OPERATION_OK)
            {
                document.getElementById("puid").textContent = new_puid;
                logm ("+ " + Art_ID.toString() + " = " + new_puid);
                
            	Mod_Counter = parseInt(Mod_Counter + Mod_Increment);
        		var val = new RM.ArtifactAttributes(Mod_Ref);
        		val.values[Attr_Counter] = Mod_Counter;
				RM.Data.setAttributes(val, function(res)
				{
				    if (res.code === RM.OperationResult.OPERATION_OK)
				    {
						document.getElementById("counter").textContent = Mod_Counter.toString() + "/" + Mod_Increment.toString();
				    }
				});
            }
        });

    }
}


function genModPUID(undef_only,reset_value)
{
    if (Mod_Ref == undefined || Mod_Prefix == undefined || Mod_Counter == undefined)
        return

	window.alert("PUID modification started...");
	if(Art_Type == "Requisito software" || Art_Type == "Requisito cliente" || Art_Type == "Requisito sistema")
		Attr_PUID = "Requirement Identifier";
    RM.Data.getContentsAttributes(Mod_Ref, [RM.Data.Attributes.IDENTIFIER,
                                            RM.Data.Attributes.ARTIFACT_TYPE, Attr_PUID], function(res)
    {
        if (res.code == RM.OperationResult.OPERATION_OK)
        {
            var puid_vals = [];
			var num_art = 0;
            res.data.forEach(function(attrs)
            {
                var art = attrs.ref;
                var id = attrs.values[RM.Data.Attributes.IDENTIFIER];
                var t = attrs.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
                Art_Type = t;
	if(Art_Type == "Requisito software" || Art_Type == "Requisito cliente" || Art_Type == "Requisito sistema")
		Attr_PUID = "Requirement Identifier";

                var puid = attrs.values[Attr_PUID];

                if (checkType(t) == true)
                {

					if (puid == null || puid == undefined || puid == "")
						puid = undefined;
					
					if (reset_value)
					{
						if (puid != undefined)
						{
							var val = new RM.ArtifactAttributes(art);
							if(Art_Type == "Requisito software" || Art_Type == "Requisito cliente" || Art_Type == "Requisito sistema")
								Attr_PUID = "Requirement Identifier";
							val.values[Attr_PUID] = "";
							puid_vals.push(val);

							logm("- " + id.toString() + ": " + puid + " --> ");
							num_art++;
						}
					}
					else
                    if (undef_only == false ||( undef_only == true &&  puid == undefined))
					{
						var new_puid = computePUID();
						Mod_Counter = parseInt(Mod_Counter + Mod_Increment);

						var val = new RM.ArtifactAttributes(art);
						if(Art_Type == "Requisito software" || Art_Type == "Requisito cliente" || Art_Type == "Requisito sistema")
							Attr_PUID = "Requirement Identifier";
						val.values[Attr_PUID] = new_puid;
						puid_vals.push(val);

						logm("+ " + id.toString() + ": " + puid + " --> " + new_puid);
						num_art++;
					}
                }
            });

			if (reset_value)
			{
				RM.Data.setAttributes(puid_vals, function(res)
				{
					if (res.code == RM.OperationResult.OPERATION_OK)
					{
						var valc = new RM.ArtifactAttributes(Mod_Ref);
						Mod_Counter = 1;

				//  Silvio		valc.values[Attr_Counter] = Mod_Counter;
						valc.values[Attr_Counter] = 0;

						RM.Data.setAttributes(valc, function(res)
						{
							if (res.code == RM.OperationResult.OPERATION_OK)
                                        		{
                                                		document.getElementById("counter").textContent = Mod_Counter.toString() + "/" + Mod_Increment.toString();
							}
						});
						window.alert("Done (" + num_art.toString() + ")");
					}
					else
						window.alert("Failed " + res.code.toString());
				});
			}
			else
			{
				var val = new RM.ArtifactAttributes(Mod_Ref);
				val.values[Attr_Counter] = Mod_Counter;
				
				RM.Data.setAttributes(val, function(res)
				{
					if (res.code == RM.OperationResult.OPERATION_OK)
					{
						document.getElementById("counter").textContent = Mod_Counter.toString() + "/" + Mod_Increment.toString();
						
						RM.Data.setAttributes(puid_vals, function(res)
						{
							if (res.code == RM.OperationResult.OPERATION_OK)
								window.alert("Done (" + num_art.toString() + ")");
							else
								window.alert("Failed " + res.code.toString());
						});
					}
				});
			}
        }
    });
}


function genAllUndefPUID()
{
    if (Mod_Ref == undefined)
    {
        window.alert("Operation is not available!");
        return;
    }
    genModPUID(true,false);
}

function genAllPUID()
{
    if (Mod_Ref == undefined)
    {
        window.alert("Operation is not available!");
        return;
    }
	Mod_Counter = 1;
	genModPUID(false,false);
}

function resetAllPUID()
{
    if (Mod_Ref == undefined)
    {
        window.alert("Operation is not available!");
        return;
    }
	genModPUID(false,true);
}


$(function()
{
window.alert("1");
	if (window.RM)
	{
		RM.Event.subscribe(RM.Event.ARTIFACT_OPENED, function(ref)
		{
			gadgets.window.adjustHeight(1);
		    RM.Data.getAttributes(ref,RM.Data.Attributes.FORMAT, function(res)
		    {
			    window.alert("2");
		        Mod_Ref = undefined;
		        Mod_Prefix = undefined;
			Mod_Increment = undefined;
		        Mod_Counter = undefined;
		        Mod_Padding = undefined;
		        Mod_Separator = undefined;
			Mod_PJcode = undefined;
			Mod_SolutionCode = undefined;
		        Art_Ref = undefined;
		        Art_ID = undefined;
		        Art_PUID = undefined;

			document.getElementById("version").textContent = Script_Version;
		        document.getElementById("prefix").textContent = "";
		        document.getElementById("counter").textContent = "";
		        document.getElementById("artid").textContent = "";
		        document.getElementById("puid").textContent = "";
		        
		        window.alert(res.code);
		        if (res.code == RM.OperationResult.OPERATION_OK)
		        {
		            if (res.data[0].values[RM.Data.Attributes.FORMAT] === RM.Data.Formats.MODULE)
		            {
		                Mod_Ref = res.data[0].ref;
		                RM.Data.getAttributes( Mod_Ref ,[RM.Data.Attributes.IDENTIFIER, Attr_Prefix, Attr_Increment, Attr_Counter, Attr_Padding, Attr_Separator], function(res)
		                {	
		                    if (res.code == RM.OperationResult.OPERATION_OK)
		                    {
		                    	var id = res.data[0].values[RM.Data.Attributes.IDENTIFIER];
					var tmp = undefined;
		                        tmp = res.data[0].values[Attr_Prefix];
		                        
		                        if (tmp != undefined)
		                        {
		                            Mod_Prefix = tmp;
								
									tmp = res.data[0].values[Attr_Increment];
		                            if (tmp != undefined)
		                                Mod_Increment = parseInt(tmp);
		                            else
		                                Mod_Increment = 10;
								
		                            tmp = res.data[0].values[Attr_Counter];
		                            if (tmp != undefined)
		                                Mod_Counter = parseInt(tmp);
		                            else
		                                Mod_Counter = 10;
		                                
		                            tmp = res.data[0].values[Attr_Padding];
		                            if (tmp != undefined)
		                                Mod_Padding = parseInt(tmp);
		                            else
		                                Mod_Padding = 4;

		                            tmp = res.data[0].values[Attr_Separator];
		                            if (tmp != undefined)
		                                Mod_Separator = tmp;
		                            else
		                                Mod_Separator = "-";
		                                
		                            document.getElementById("prefix").textContent = Mod_Prefix;
		                            document.getElementById("counter").textContent = Mod_Counter.toString() + 
		                            						"/" +  Mod_Increment.toString();
									gadgets.window.adjustHeight(Window_Height);
		                            //window.alert("ok");
		                        }

		                    }
		                });

		            }

		        }

		    });
		});
		
		RM.Event.subscribe(RM.Event.ARTIFACT_CLOSED, function(ref)
		{
			gadgets.window.adjustHeight(1);
		});

		RM.Event.subscribe(RM.Event.ARTIFACT_SELECTED, function(ref)
		{
		    Art_Ref = undefined;
		    Art_ID = undefined;
		    Art_PUID = undefined;
		    document.getElementById("artid").textContent = "";
		    document.getElementById("puid").textContent = "";

		    if (ref.length == 1 && Mod_Counter != undefined)
		    {
		       // window.alert("read");
		        RM.Data.getAttributes(ref[0], [RM.Data.Attributes.IDENTIFIER,
		                                       RM.Data.Attributes.ARTIFACT_TYPE] , function(res)
		        {
		        	//console.log("SELECTION")
		        	
		            Art_Ref = undefined;
		            if (res.code == RM.OperationResult.OPERATION_OK)
		            {
		                var id = res.data[0].values[RM.Data.Attributes.IDENTIFIER];
		                var t = res.data[0].values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				Art_Type = t;
		                //window.alert(t);
		                if (checkType(t) == true)
		                {
		                    Art_Ref = res.data[0].ref;
		                    Art_ID = id;
		                    //window.alert(id);
		                    document.getElementById("artid").textContent = id.toString();

				    if(Art_Type == "Stakeholder Requirement" || Art_Type == "System Requirement" || Art_Type == "Interface Requirement")
					Attr_PUID = "Requirement Identifier";	

		                    RM.Data.getAttributes(Art_Ref, [Attr_PUID] , function(res)
		                    {
		                        if (res.code == RM.OperationResult.OPERATION_OK)
		                        {
		                            Art_PUID = res.data[0].values[Attr_PUID];
		                            //window.alert("prev puid: " + Art_PUID);
		                            if (Art_PUID == null || Art_PUID == undefined || Art_PUID == "")
		                            {
		                                Art_PUID == undefined;
		                                var new_puid = computePUID();
		                                   
		                                //window.alert("new puid: " + new_puid);
		                                document.getElementById("puid").textContent = ">>> " + new_puid;
		                            }
		                            else
		                            {
		                                document.getElementById("puid").textContent = Art_PUID;
		                            }
		                        }
		                        else
		                        {
		                            Art_Ref = undefined;
		                            Art_ID = undefined;
		                            Art_PUID = undefined;
		                            document.getElementById("artid").textContent = "";
		                            document.getElementById("puid").textContent = "";
		                        }
		                    });
		                }
		            }
		        });
		    }
		});

	}
	else
	{
		gadgets.window.adjustHeight(1);
	}
    
});







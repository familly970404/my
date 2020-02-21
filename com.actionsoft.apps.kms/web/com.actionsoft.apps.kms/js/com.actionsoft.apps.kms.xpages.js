var transparent="1";
$(document).ready(function(){
	var kmsDataListInfo=kmsDataList[0];
	renderKmsData(kmsDataListInfo);
});

function renderKmsData(kmsDataListInfo){
   var htmStr="";  
   if(kmsDataListInfo.length>0){
		for (var i=0; i < kmsDataListInfo.length; i++) {
			 var info= kmsDataListInfo[i];
			 var id= info.id;
			 htmStr+=' 			<ul class="kmsmsg-list-row" rowid="'+id+'">';
			 htmStr+='						<li class="w70 leftalign" rowid="'+id+'">';
			 htmStr+=							'<div   class="cardname">'+info.cardName+"</div>";
			 htmStr+=							'<div   class="cardpath">'+info.dimensionPath+"</div>";
			 htmStr+='						</li>';
			 htmStr+='						<li class="w30 rightalign" style="">';
			 htmStr+='							<div class="cardright">'+info.publishUsername+"<BR/>"+ info.publishTime+'</div>';					    
			 htmStr+='						</li>';
			 htmStr+='		   </ul>	';
		};
   }else{
   	htmStr+="<div class='no-record-div'></div>";
   }
	
  $(".kmsmsg-list").empty();
  $(".kmsmsg-list").append(htmStr);
  $(".kmsmsg-list-row").find(".cardname").off("click").on("click",function(){
  	 //侧边栏
		var	width="700px";
		var id=$(this).parent().attr("rowid");
		var url="./w?sid="+sid+"&cmd=com.actionsoft.apps.kms_knwl_center_browse_card_page&cardId="+id+"&isPage=true";
		window.top.$.openSidebar({
			url: url,
			title:"" ,
			closeText: "收起",
			width: width,
			isMode: false,
			duration: "slow",
			iframeId: id
		});
  });
  
  
  var frameId = window.frameElement && window.frameElement.id || '';  
  //通过页面找iframe  
	if(window.parent.$("#"+frameId).length!=0){
	  transparent=  window.parent.$("#"+frameId).attr("transparent");
	}
	
	//透明度
	if(0< parseFloat(transparent) && parseFloat(transparent)<1){
		$("body").css("background","none");//ffffff
		$("body").css("background-color","none");//ffffff
		$(".kmsmsg-list-row").css("border-bottom","1px solid #bbb");//ffffff
		
	}
  
}

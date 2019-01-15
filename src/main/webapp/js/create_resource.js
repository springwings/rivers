var tempIndexTD;
var tempTransParamTD;
var tempSearchParamTD;

/**
 * 生成 alias 部分xml
 * @returns {string}
 */
function alias2XML() {
    var txt = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    txt += "<config>\n";
    var es_alias_name=$("#es_alias_name").val();
    if (!isNull(es_alias_name)) {
        txt += "<dataflow alias=\""+es_alias_name+"\">\n";
    }else {
        txt +="<dataflow>"
	}
    return txt;
}

/**
 * 生成 trans_params_table 部分xml
 * @returns {string}
 */
function transParamsTable2XML() {
    var txt = "\t<TransParam>\n";
    var table = document.getElementById('trans_params_table');
    var row = table.getElementsByTagName("tr");
    var col = row[0].getElementsByTagName("th");
    for (var j = 1; j < row.length; j++) {
        var r = "\t\t<param>\n";
        var tds = row[j].getElementsByTagName("td");
        //最后一格是编辑 所以-1
        for (var i = 0; i < col.length -1; i++) {
            r += "\t\t\t<" + col[i].innerHTML + ">" + tds[i].innerHTML + "</" + col[i].innerHTML + ">\n";
        }
        r += "\t\t</param>\n";
        txt += r;
    }
    txt += "\t</TransParam>\n";
    return txt;
}


/**
 * 生成 sql 部分xml
 * @returns {string}
 */
function sql2XML() {
    var txt = "\t<ReadParam>\n";
    txt += "\t\t<sql ";
    $(".form-sql").each(function () {
        var value = $(this).val();
        if (value !== null && value !== undefined && value.trim() !== '') {
            txt += $(this).attr("id") + "=\"" + value + "\" ";
        }
    });
    txt += ">\n";
    txt += "<![CDATA[\n";
    txt += $("#sqlTextarea").val();
    txt += "\n]]>\n";
    txt += "\t\t</sql>\n";

    var pageScanTextarea = $("#pageScanTextarea").val();
    if (!isNull(pageScanTextarea)) {
        txt += "\t\t<pageScan>\n";
        txt += "<![CDATA[\n";
        txt += pageScanTextarea;
        txt += "\n]]>\n";
        txt += "\t\t</pageScan>\n";
    }
    txt += "\t</ReadParam>\n";
    return txt;
}

/**
 * 生成 create_es_table 部分xml
 * @returns {string}
 */
function createEsTable2XML() {
    var txt = "\t<WriteParam>\n";
    txt += "\t\t<fields>\n";
    var table = document.getElementById('create_es_table');
    var row = table.getElementsByTagName("tr");
    var col = row[0].getElementsByTagName("th");
    for (var j = 1; j < row.length; j++) {
        var r = "\t\t\t<field";
        var tds = row[j].getElementsByTagName("td");
        //最后一格是编辑 所以-1
        for (var i = 0; i < col.length - 1; i++) {
            var tdsValue = tds[i].innerHTML;
            if (!isNull(tdsValue)) {
                r += " " + col[i].innerHTML + "=\"" + tdsValue + "\"";
            }
        }
        r += " />\n";
        txt += r;
    }
    txt += "\t\t</fields>\n";
    txt += "\t</WriteParam>\n";
    return txt;
}

/**
 * 生成 search_params_table 部分xml
 * @returns {string}
 */
function searchParamsTable2XML() {
    var txt = "\t<SearchParam>\n";
    var table = document.getElementById('search_params_table');
    var row = table.getElementsByTagName("tr");
    var col = row[0].getElementsByTagName("th");
    for (var j = 1; j < row.length; j++) {
        var r = "\t\t<param>\n";
        var tds = row[j].getElementsByTagName("td");
        //最后一格是编辑 所以-1
        for (var i = 0; i < col.length -1; i++) {
        	var tdsValue=tds[i].innerHTML;
            if (!isNull(tdsValue)) {
                r += "\t\t\t<" + col[i].innerHTML + ">" + tdsValue + "</" + col[i].innerHTML + ">\n";
            }
        }
        r += "\t\t</param>\n";
        txt += r;
    }
    txt += "\t</SearchParam>\n";
    txt += "</dataflow>\n";
    return txt;
}

function combineAllXML() {
    var txt = "";

    txt += alias2XML()+transParamsTable2XML()+sql2XML()+createEsTable2XML()+searchParamsTable2XML();
    txt += "</config>";
    return txt;
}
function select_into(type){ 
	$("#select_method").hide();
	if(type=="xml"){
		$("#xml_method").show();
		$("#daohang_method").remove();
	}else{
		$("#daohang_method").show();
		$("#xml_method").remove();
	}
}
function createXML(xml) {
	var content,instanceName;
    var number = 0;

	if(xml!=null){
		instanceName = $('#instance_name').val();
        if (isNull(instanceName)) {
            alert("实例名称必填");
            return;
        }
		content = $(xml).parent().find("#xmlTextarea").val();
        $('input:checkbox[name=xmlCheckbox]:checked').each(function () {
            number += Number($(this).val());
        })
	}else{

		instanceName = $('#es_instance_name').val();
        if (isNull(instanceName)) {
            alert("实例名称必填");
            return;
        }
        if ($("#trans_params_table tbody").children("tr").length == 0) {
            alert("TransParams必填");
            return;
        }
        if ($("#create_es_table tbody").children("tr").length == 0) {
            alert("ES表结构必填");
            return;
        }
        if ($("#search_params_table tbody").children("tr").length == 0) {
            alert("SearchParams必填");
            return;
        }

        if (isNull($("#keyColumn").val())) {
            alert("主键必填");
            return;
        }
        if (isNull($("#incrementField").val())) {
            alert("增量扫描比较字段必填");
            return;
        }
        if (isNull($("#sqlTextarea").val())) {
            alert("sql必填");
            return;
        }
		content = combineAllXML();
        $('input:checkbox[name=esCheckbox]:checked').each(function () {
            number += Number($(this).val());
        })
	}
    $.ajax({
        url : global_service_url + "server/createInstanceConfig",
        data : {
            instance:instanceName,
            data: content,
            type: number
        },
        type : 'POST',
        dataType : "json",
        contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
        success : function(data) {
            if (data === 400) {
                alert("连接失败");
                return;
            }
            alert("success");
            window.location.href=global_service_url+"/instances.html";
        },
        error : function(data) {
            alert("连接失败");
        }
    });

}

$(document).on('click','a.del_cat', function(){
    $(this).parent().parent("tr").remove();
});


$(document).on('click','#insert_index', function(){

    if (isNull($("#es_name_text").val())) {
        alert("来源名称必填");
        return;
    }
    if (isNull($("#paramname_text").val())) {
        alert("存储名称必填");
        return;
    }
    var name = $("#es_name_text").val();
    var handler = $("#handler_text").val();
    var router = $("#router_selectpicker").val();
    var indexed = $("#indexed_selectpicker").val();
    var stored = $("#stored_selectpicker").val();
    var indextype = $("#indextype_selectpicker").val();
    var separator = $("#separator_text").val();
    var analyzer = $("#analyzer_text").val();
    var dsl = $("#dsl_text").val();
    var paramname = $("#paramname_text").val();
    var paramtype = $("#paramtype_index_selectpicker").val();
    $("#create_es_table tbody").append('<tr class="cat_list"><td>'+name+'</td><td>'+handler+'</td><td>'+router+'</td><td>'+indexed+'</td><td>'+stored+'</td><td>'+indextype+'</td><td>'+separator+'</td><td>'+analyzer+'</td><td>'+dsl+'</td><td>'+paramname+'</td><td>'+paramtype+'</td><td><a data-toggle="modal" data-target="#CreateIndexModal"  onclick="updateCreateIndexModal(this)" title="编辑" href="#"><i class="fa fa-edit"></i></a><a title="删除" class="btn btn-circle btn-pink del_cat"><i class="fa fa-times"></i></a></td>');
    $('#CreateIndexModal').modal('hide');
});


$(document).on('click','#insert_para_index', function(){
    if (isNull($("#param_name").val())) {
        alert("参数名称必填");
        return;
    }
    var param_name = $("#param_name").val();
    var paramtype_selectpicker = $("#paramtype_selectpicker").val();
    var defaultValue_text = $("#defaultValue_text").val();
    var includeLower_selectpicker = $("#includeLower_selectpicker").val();
    var includeUpper_selectpicker = $("#includeUpper_selectpicker").val();
    var fields_text = $("#fields_text").val();
    $("#search_params_table tbody").append('<tr class="cat_list"><td>'+param_name+'</td><td>'+paramtype_selectpicker+'</td><td>'+defaultValue_text+'</td><td>'+includeLower_selectpicker+'</td><td>'+includeUpper_selectpicker+'</td><td>'+fields_text+'</td><td><a data-toggle="modal" data-target="#SearchParamsModal"  onclick="updateSearchParamModal(this)" title="编辑" href="#"><i class="fa fa-edit"></i></a><a title="删除" class="btn btn-circle btn-pink del_cat"><i class="fa fa-times"></i></a></td>');
    $('#SearchParamsModal').modal('hide');
});

$(document).on('click','#insert_trans_index', function(){
    var transname_selectpicker = $("#transname_selectpicker").val();
    var transparam_name = $("#transparam_name").val();
    if (isNull(transparam_name)) {
        alert("value 必填");
        return;
    }
    $("#trans_params_table tbody").append('<tr class="cat_list"><td>'+transname_selectpicker+'</td><td>'+transparam_name+'</td><td><a data-toggle="modal" data-target="#TransParamsModal" onclick="updateTransParamModal(this)" title="编辑" href="#"><i class="fa fa-edit"></i></a><a title="删除" class="btn btn-circle btn-pink del_cat"><i class="fa fa-times"></i></a></td>');

    $('#TransParamsModal').modal('hide');

});

function updateCreateIndexModal(obj){
    var $td=$(obj).parents('tr').children('td');
    tempIndexTD=$td;
    $("#es_name_text").val($td.eq(0).text());
    $("#handler_text").val($td.eq(1).text());
    $("#router_selectpicker").val($td.eq(2).text());
    $("#indexed_selectpicker").val($td.eq(3).text());
    $("#stored_selectpicker").val($td.eq(4).text());
    $("#indextype_selectpicker").val($td.eq(5).text());
    $("#separator_text").val($td.eq(6).text());
    $("#analyzer_text").val($td.eq(7).text());
    $("#dsl_text").val($td.eq(8).text());
    $("#paramname_text").val($td.eq(9).text());
    $("#paramtype_index_selectpicker").val($td.eq(10).text());

    var content = "<button id=\"update_index\" type=\"button\"" +
        "onclick=\"update_index(obj)\" class=\"btn btn-success\"" +
        ">update</button>"
    $("#insert_index").replaceWith(content);
}

function updateTransParamModal(obj){
    var $td=$(obj).parents('tr').children('td');
    tempTransParamTD=$td;
    $("#transname_selectpicker").val($td.eq(0).text());
    $("#transparam_name").val($td.eq(1).text());

    var content = "<button id=\"update_trans_index\" type=\"button\"" +
        "onclick=\"update_trans_index(obj)\" class=\"btn btn-success\"" +
        ">update</button>"
    $("#insert_trans_index").replaceWith(content);
}

function updateSearchParamModal(obj){
    var $td=$(obj).parents('tr').children('td');
    tempSearchParamTD=$td;
    $("#param_name").val($td.eq(0).text());
    $("#paramtype_selectpicker").val($td.eq(1).text());
    $("#defaultValue_text").val($td.eq(2).text());
    $("#includeLower_selectpicker").val($td.eq(3).text());
    $("#includeUpper_selectpicker").val($td.eq(4).text());
    $("#fields_text").val($td.eq(5).text());


    var content = "<button id=\"update_search_index\" type=\"button\"" +
        "onclick=\"update_search_index(obj)\" class=\"btn btn-success\"" +
        ">update</button>"
    $("#insert_para_index").replaceWith(content);
}



$(document).on('click','#update_index', function(){

    if (isNull($("#es_name_text").val())) {
        alert("来源名称必填");
        return;
    }
    if (isNull($("#paramname_text").val())) {
        alert("存储名称必填");
        return;
    }
    $td=tempIndexTD;
    $td.eq(0).text($("#es_name_text").val());
    $td.eq(1).text($("#handler_text").val());
    $td.eq(2).text($("#router_selectpicker").val());
    $td.eq(3).text($("#indexed_selectpicker").val());
    $td.eq(4).text($("#stored_selectpicker").val());
    $td.eq(5).text($("#indextype_selectpicker").val());
    $td.eq(6).text($("#separator_text").val());
    $td.eq(7).text($("#analyzer_text").val());
    $td.eq(8).text($("#dsl_text").val());
    $td.eq(9).text($("#paramname_text").val());
    $td.eq(10).text($("#paramtype_index_selectpicker").val());
    $('#CreateIndexModal').modal('hide');
});

$(document).on('click','#update_trans_index', function(){
    var transparam_name = $("#transparam_name").val();
    if (isNull(transparam_name)) {
        alert("value 必填");
        return;
    }

    $td=tempTransParamTD;
    $td.eq(0).text($("#transname_selectpicker").val());
    $td.eq(1).text(transparam_name);
    $('#TransParamsModal').modal('hide');
});

$(document).on('click','#update_search_index', function(){

    if (isNull($("#param_name").val())) {
        alert("参数名称必填");
        return;
    }
    $td=tempSearchParamTD;
    $td.eq(0).text($("#param_name").val());
    $td.eq(1).text($("#paramtype_selectpicker").val());
    $td.eq(2).text($("#defaultValue_text").val());
    $td.eq(3).text($("#includeLower_selectpicker").val());
    $td.eq(4).text($("#includeUpper_selectpicker").val());
    $td.eq(5).text($("#fields_text").val());
    $('#SearchParamsModal').modal('hide');
});


$(document).on('hidden.bs.modal','#CreateIndexModal', function () {
    var content = "<button id=\"insert_index\" type=\"button\"" +
        "onclick=\"insert_index()\" class=\"btn btn-success\"" +
        ">Save</button>"
    $("#update_index").replaceWith(content);
    $(this).find('form')[0].reset();
})

$(document).on('hidden.bs.modal','#TransParamsModal', function () {
    var content = "<button id=\"insert_trans_index\" type=\"button\"" +
        "onclick=\"insert_trans_index()\" class=\"btn btn-success\"" +
        ">Save</button>"
    $("#update_trans_index").replaceWith(content);
    $(this).find('form')[0].reset();
})


$(document).on('hidden.bs.modal','#SearchParamsModal', function () {
    var content = "<button id=\"insert_para_index\" type=\"button\"" +
        "onclick=\"insert_para_index()\" class=\"btn btn-success\"" +
        ">Save</button>"
    $("#update_search_index").replaceWith(content);
    $(this).find('form')[0].reset();
})


function isNull(value) {
    if (value !== null && value !== undefined && value.trim() !== '') {
        return false;
    } else {
        return true;
    }
}


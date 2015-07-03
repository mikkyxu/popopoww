;(function(){
    // var _baseUrl  = "http://192.168.1.162:81/api/1/";
    var _baseUrl  = "http://erp.2quan.cn/api/1/";
    var _get = function(url,param,success,error){
        _ajax('get',url,param,success,error);
    }
    var _post = function(url,param,success,error){
        _ajax('post',url,param,success,error);
    }
    var _ajax = function(type,url,param,success,error){
        if(url.substr(0,4)!='http'){
            url = _baseUrl+url;
        }

        var userInfo = JSON.parse(window.localStorage.getItem('userInfo'));
        var param2 = {};
        if(userInfo&&userInfo.ak&&userInfo.sn&&userInfo.eId){
            param2.ak = userInfo.ak;
            param2.sn = userInfo.sn;
            param2.userid = userInfo.eId;
        }

        //if(location.protocol == 'http:'){
            if(type == 'get'){
                url = url+'?'+ $.param(param)+'&'+$.param(param2);
                param = {};
            }else{
                url = url+'?'+ $.param(param2);
            }
        //}

        var options = {
            url : url,
            type : type||'get',
            data : param,
            timeout : 120000,//超时时间默认2分钟
            success : success,
            cache : type == 'get'?false:true,
            error : function(xhr,type){
                if(error){
                    error(xhr,type);
                }else{
                    _parseError(xhr,type,url);
                }
            },
            dataType : 'json'
        }
        $.ajax(options);
    }

    function _parseError(xhr,type,url){
        if(J.hasPopupOpen){
            J.hideMask();
        }
        if(type == 'timeout'){
            J.showToast('连接服务器超时,请检查网络是否畅通！','error');
        }else if(type == 'parsererror'){
            J.showToast('解析返回结果失败！','error');
        }else if(type == 'error'){
            var data;
            try{
                data = JSON.parse(xhr.responseText);
                if(data.code && data.message){
                    J.showToast(data.message,'error');
                }else{
                    J.showToast('连接服务器失败！','error');
                }
            }catch(e){
                J.showToast('连接服务器失败！','error');
            }
        }else{
            J.showToast('未知异常','error');
        }
    }

    window.crmApi = {
        'login' : function(username,pwd,success,error){
            if(App.debug){
                _get('http://erp.2quan.cn/api/1/webAuth.php',{userName:username,password:pwd,ak:'dGRwX2NhcHAwNA==',token:'1'},success,error);
            }else{
                _get('webAuth.php',{userName:username,password:pwd,ak:'dGRwX2NhcHAwNA==',token:'1'},success,error);
            }
        },
        'getClientList' : function(userid,usertype,success,error){
            if(App.debug){
                 $.getJSON('data/client.json',success);
            }else{
                 _get('CRM_ReadedCustomList.php',{userid:userid,usertype:usertype},success,error);
            }
        },
        'getClientDetail' : function(customid,success,error){
            if(App.debug){
                 $.getJSON('data/clientDetail.json',success);
            }else{
                 _get('CRM_CustomList.php',{CustomID:customid},success,error);
            }
        },
        'getPreSale' : function(progress_id,success,error){
            if(App.debug){
                 $.getJSON('data/getPreSale.json',success);
            }else{
                 _get('CRM_Step1Sel.php',{pid:progress_id},success,error);
            }
        },
        'setPreSale' : function(params,success,error){
            if(App.debug){
                 $.getJSON('data/response.json',success);
            }else{
                 _post('CRM_Step1Upd.php',params,success,error);
            }
        },
        'delPreSale' : function(id,progress_id,success,error){
            if(App.debug){
                 $.getJSON('data/response.json',success);
            }else{
                 _post('CRM_Step1Del.php',{pid:progress_id,id:id},success,error);
            }
        },

        'getSaleList' : function(customid,type,success,error){
            if(App.debug){
                 $.getJSON('data/alllist.json',success);
            }else{
                 _get('CRM_StepAllSel.php',{pcid:customid,type:type},success,error);
            }
        },
        'getInSale' : function(progress_id,id,success,error){
            if(App.debug){
                 $.getJSON('data/getInSale.json',success);
            }else{
                 _get('CRM_Step2Sel.php',{pid:progress_id,id:id},success,error);
            }
        },
        'setInSale' : function(params,success,error){
            if(App.debug){
                 $.getJSON('data/response.json',success);
            }else{
                 _post('CRM_Step2Upd.php',params,success,error);
            }
        },
        'delInSale' : function(id,progress_id,success,error){
            if(App.debug){
                 $.getJSON('data/clientDetail.json',success);
            }else{
                 _post('CRM_Step2Del.php',{id:id,pid:progress_id},success,error);
            }
        },

        'getAfterSale' : function(progress_id,success,error){
            if(App.debug){
                 $.getJSON('data/getAfterSale.json',success);
            }else{
                 _get('CRM_Step3Sel.php',{pid:progress_id},success,error);
            }
        },
        'setAfterSale' : function(params,success,error){
            if(App.debug){
                 $.getJSON('data/response.json',success);
            }else{
                 _post('CRM_Step3Upd.php',params,success,error);
            }
        },
        'delAfterSale' : function(id,progress_id,success,error){
            if(App.debug){
                 $.getJSON('data/clientDetail.json',success);
            }else{
                 _post('CRM_Step3Del.php',{id:id,pid:progress_id},success,error);
            }
        },
        // 'getPaymentList' : function(customid,type,success,error){
        //     if(App.debug){
        //          $.getJSON('data/alllist.json',success);
        //     }else{
        //          _get('CRM_StepAllSel.php',{pcid:customid,type:type},success,error);
        //     }
        // },
        'getPayment' : function(progress_id,id,success,error){
            if(App.debug){
                 $.getJSON('data/getPayment.json',success);
            }else{
                 _get('CRM_Step4Sel.php',{pid:progress_id,id:id},success,error);
            }
        },
        'setPayment' : function(params,success,error){
            if(App.debug){
                 $.getJSON('data/response.json',success);
            }else{
                 _post('CRM_Step4Upd.php',params,success,error);
            }
        },
        'delPayment' : function(id,progress_id,success,error){
            if(App.debug){
                 $.getJSON('data/response.json',success);
            }else{
                 _post('CRM_Step4Del.php',{id:id,pid:progress_id},success,error);
            }
        },
        'getApprovalList' : function(id,pid,success,error){
            if(App.debug){
                 $.getJSON('data/client.json',success);
            }else{
                 _get('CRM_AuditSel.php',{pid:pid,step2id:step2id},success,error);
            }
        }


    }
})();

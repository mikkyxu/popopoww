var App = (function(){
    var debug = false;
    var pages = {};
    var run = function(){
        $.each(pages,function(k,v){
            var sectionId = '#'+k;
            $('body').delegate(sectionId,'pageinit',function(){
                v.init && v.init.call(v);
            });
            $('body').delegate(sectionId,'pageshow',function(e,isBack){
                //页面加载的时候都会执行
                v.show && v.show.call(v);
                //后退时不执行
                if(!isBack && v.load){
                    v.load.call(v);
                }
            });
        });
        Jingle.launch({
            showWelcome:false
            // transitionType:'slideUp'
        });

        _initUserInfo();
    };

    var page = function(id,factory){
        return ((id && factory)?_addPage:_getPage).call(this,id,factory);
    }

    var _addPage = function(id,factory){
        pages[id] = new factory();
    };

    var _getPage = function(id){
        return pages[id];
    }

    var checkNetwork = function(){
        if(!navigator.connection)return true;
        var networkState = navigator.connection.type;
        if(networkState == Connection.CELL_2G){
            var network2g = localStorage.getItem("network-2g");
            if(network2g == 0){
                return true;
            }else{
                return confirm('您当前使用的是2G网络，是否继续？');
            }
        }else if(networkState == Connection.NONE){
            if(confirm('当前没有网络连接,是否使用离线方式访问？')){
                J.offline = true;
                $('#btn_offline').val(1);
                return true;
            }
            return false;
        }
        return true;
    }

    var showLogin = function(callback){
        J.Router.goTo('#login');
    }

    var _initUserInfo = function(){
        var userInfo = window.localStorage.getItem('userInfo');
        userInfo && (App.userInfo = JSON.parse(userInfo));
    }

    return {
        run : run,
        page : page,
        checkNetwork : checkNetwork,
        showLogin : showLogin,
        debug : debug
    }
}());
if(J.isWebApp){
    $(function () {
        App.run();
    })
}

App.page('login',function(){
    this.init = function(){
        $('#btn_login').tap(function(){
            _login(function(){J.Router.goTo('#index');});
        });
    };

    var _login = function(callback){
        var username = $('#username').val();
        var pwd = $('#password').val();
        if(username == '' || pwd == ''){
            J.showToast('请填写完整的信息！');
        }else{
            J.showMask(); 
            $('#btn_login .icon').removeClass('lock').addClass('spinner');
            crmApi.login(username,pwd,function(data){
                J.hideMask();
                $('#btn_login .icon').removeClass('spinner').addClass('lock');
                if(data.status!=0){
                    J.showToast(data.message,'error');
                }else{
                    App.userInfo = data.result;
                    window.localStorage.setItem('userInfo',JSON.stringify(data.result));
                    callback.call();
                }
            },function(){
                J.hideMask();
                J.showToast('请检查您的网络连接','error');
            });
             
        }
        return false;
    }
})

App.page('submenu',function(){
    var $list,$section;
    this.init = function(){
        $list = $('#submenu_article ul');
        $list.on('tap','li',function(){
           App.page('SaleList').mtype = $(this).attr('data-menuType');
            $section = $(this).attr('data-section');
            //alert($section);
            J.Router.goTo($section);
        });
    };

    var data = {};
    this.load = function(){
        data.menuType = this.menuType;
        data.companyId = this.companyId;
        J.tmpl('#submenu_article ul','submenu_tpl',data);
        $('#submenu h1.title').html(this.companyName);
    };

});

App.page('index',function(){
    this.init = function(){
        if(!App.userInfo){
            App.showLogin();
        }
        $('#index ul').on('tap','li',function(){
            App.page('submenu').menuType = $(this).parent().children(".divider").attr('data-menuType');
            App.page('submenu').companyId = $(this).attr('data-no');
            App.page('submenu').pId = $(this).attr('data-pid');
            App.page('submenu').companyName = $(this).attr('data-name');
            J.Router.goTo('#submenu');
            if(App.page('submenu').menuType =='2'){
                App.page('SaleList').dstatus = $(this).attr('data-status');
            }
        });
    };
    this.load = function(){
        if(!App.userInfo){
            return false;
        }
        _initIndex();
    }
    _initIndex = function(){
        if(App.debug){
           console.info(App.userInfo); 
        }
        J.showMask(); 
        switch (App.userInfo.uName) {
            case "销售经理": uType = 1 ; break;
            case "销售代表": uType = 2 ; break;
        }
        crmApi.getClientList(App.userInfo.eId,uType,function(data){
            J.hideMask(); 
            if(data.status!=0){
              J.showToast(data.message,'error');
            }else{
              J.tmpl('#index_pre_sale_article ul','tel_article01_tpl',data);
              J.tmpl('#index_in_sale_article ul','tel_article02_tpl',data);
              J.tmpl('#index_sign_article ul','tel_article03_tpl',data);
              J.tmpl('#index_payment_article ul','tel_article04_tpl',data); 
              J.Scroll('#index_pre_sale_article');
              J.Scroll('#index_in_sale_article');
              J.Scroll('#index_sign_article');
              J.Scroll('#index_payment_article');
            }
        },function(){
            J.showToast('请检查您的网络连接','error');
        });

    }
});

App.page('clientDetail',function(){
    this.load = function(){
        $('#clientDetail_article div').empty();
        var id = App.page('submenu').companyId;
        J.showMask(); 
        crmApi.getClientDetail(id,function(data){
            J.hideMask(); 
            if(data.status!=0){
                J.showToast(data.message,'error');
            }else{
                J.tmpl('#clientDetail_article div','client_tpl',data.result[0]); 
                J.Scroll('#clientDetail_article');
            }
        },function(){
            J.hideMask();
            J.showToast('请检查您的网络连接','error');
        });
    };
});

App.page('approval',function(){
    this.load = function(){
        $('#Approval_article div').empty();
        var pid = App.page('submenu').pId ;
        var id = App.page('submenu').sId;
        J.showMask(); 
        crmApi.getApprovalList(id,pid,function(data){
            J.hideMask(); 
            if(data.status!=0){
                J.showToast(data.message,'error');
            }else{
                J.tmpl('#Approval_article div','approval_tpl',data.result[0]); 
                J.Scroll('#Approval_article');
            }
        },function(){
            J.hideMask();
            J.showToast('请检查您的网络连接','error');
        });
    };
});

App.page('SaleList',function(){
    var arr0 = ['','售前','售中','签约','回款','审批'];
    var arr1 = ['','#preSale','#inSale','#afterSale','#payment','#approval'];
    this.init = function(){
        if(!App.userInfo){
            App.showLogin();
        }
        $list = $('#SaleList ul');
        $list.on('tap','li',function(){
            $section = $(this).attr('data-section');
            $page = $section.replace('#','');
            App.page($page).sid = $(this).attr('data-id');
            App.page($page).pid = $(this).attr('data-pid');
            J.Router.goTo($section);
        });
        $('#SaleList a#addlist').on('tap','',function(){
            for (var i = arr1.length - 1; i > 0; i--) {
                var page =arr1[i].replace('#','');
                App.page(page).sid = null;
                App.page(page).pid = null;
            };
       
            J.Router.goTo($('#SaleList a#addlist').attr('href'));
        });
        //隐藏回款新增按钮菜单
 

    }
    this.load = function(){
        if(this.mtype==4||(this.mtype==2&&this.dstatus!="0")){
            $('#SaleList a#addlist').hide();
        }else{
            $('#SaleList a#addlist').show();
        }
        $('#SaleList_article ul').empty();
        var customid = App.page('submenu').companyId;
        var type = this.mtype;

        $('#SaleList h1.title').html(arr0[type]+"列表");
        $('#SaleList a#addlist').attr('href',arr1[type]);
        J.showMask(); 
        crmApi.getSaleList(customid,type,function(data){
            J.hideMask(); 
            if(data.status!=0){
                J.showToast(data.message,'error');
            }else{
                if(data.result){
                    J.tmpl('#SaleList_article ul','salelist_tpl',data); 
                }else{
                    J.Template.no_result("#SaleList_article ul");
                    // J.showToast('暂无数据','error');
                }
            }
        },function(){
            J.hideMask(); 
            J.showToast('请检查您的网络连接','error');
        });
    };
})

App.page('preSale',function(){
    this.init = function(){
        J.Scroll('#preSale article');
        $("#preSale a.submit").on('tap','',function(){
          // if(!_checkForm()) return false;
           J.showMask();
           param = $('#preSale form').serialize();
           crmApi.setPreSale(param,function(data){
               J.hideMask(); 
               if(data.status!=0){
                   J.showToast(data.message,'error');
               }else{
                    J.showToast('保存成功','success');
                    J.Router.goTo("#index");
               }
           },function(){
               J.hideMask();
               J.showToast('请检查您的网络连接','error');
           });
        });
    };

    var _checkForm = function(callback){
        var num =/^\d{1,12}(\.\d{1,4})?$/;
        if($('#Sample').val()==''){
            J.showToast("产品样品不为空",'error');
            return false;
        }
        if($('#Manual').val()==''){
            J.showToast("产品手册不为空",'error');
            return false;
        }
        if($('#Present').val()==''){
            J.showToast("礼品名称不为空",'error');
            return false;
        }
        if($('#Count').val()==''||!num.test($('#Count').val())){
            J.showToast("数量不为空或不是数字",'error');
            return false;
        }
        if($('#FutureSale').val()==''||!num.test($('#FutureSale').val())){
            J.showToast("预估数量不为空或不是数字",'error');
            return false;
        }
        if($('#Discount').val()==''||!num.test($('#Discount').val())){
            J.showToast("折扣不为空或不是数字",'error');
            return false;
        }
        if($('#PlanDate').val()==''){
            J.showToast("安排日期不为空",'error');
            return false;
        }
        if($('#Color').val()==''){
            J.showToast("标识不为空",'error');
            return false;
        }
        return true;
    }

    this.load = function(){
        $('#preSale form')[0].reset();
        $('input[name=pid]').val(App.page("submenu").pId);
        if(!this.pid){
            return;
        }
        J.showMask();

        crmApi.getPreSale(this.pid,function(data){
            J.hideMask();
            $.each(data.result[0], function (key, value) {
                $("#" + key.replace("Step1_", "")).val(value);
            });
        },function(){
           J.hideMask();
           J.showToast('请检查您的网络连接','error');
        });
    }
})

App.page('afterSale',function(){
    this.init = function(){
        $("#afterSale a.submit").on('tap','',function(){
           if(!_checkForm()) return false;
           J.showMask();
           param = $('#afterSale form').serialize();
           crmApi.setAfterSale(param,function(data){
               J.hideMask(); 
               if(data.status!=0){
                   J.showToast(data.message,'error');
               }else{
                   J.showToast('保存成功','success');
                   J.Router.goTo("#index");
               }
           },function(){
               J.hideMask();
               J.showToast('请检查您的网络连接','error');
           });
        });
    };

    var _checkForm = function(callback){
        var num =/^\d{1,12}(\.\d{1,4})?$/;
        if($('#BackMoneyMode').val()==''){
            J.showToast("回款方式不为空",'error');
            return false;
        }
        if($('#BackMoneyTime').val()==''||!num.test($('#BackMoneyTime').val())){
            J.showToast("回款周期不为空或不是数字",'error');
            return false;
        }
        if($('#RealSaleCount').val()==''||!num.test($('#RealSaleCount').val())){
            J.showToast("实际销量不为空或不是数字",'error');
            return false;
        }
        if($('#Discount').val()==''||!num.test($('#Discount').val())){
            J.showToast("折扣率不为空或不是数字",'error');
            return false;
        }
        if($('#PresentCount').val()==''||!num.test($('#PresentCount').val())){
            J.showToast("赠送数量不为空或不是数字",'error');
            return false;
        }
        if($('#GeneOrder').val()==''){
            J.showToast("生成订单不为空",'error');
            return false;
        }
        if($('#BillType').val()==''){
            J.showToast("发票类型不为空",'error');
            return false;
        }
        return true;
    }

    this.load = function(){
        $('#afterSale form')[0].reset();
        $('input[name=pid]').val(App.page("submenu").pId);
        if(!this.pid){
            return;
        }
        J.showMask();

        $("#afterSale a.submit").hide();
        crmApi.getAfterSale(this.pid,function(data){
            J.hideMask();
            $.each(data.result[0], function (key, value) {
                $("#" + key.replace("Step3_", "")).val(value);
            });
        },function(){
           J.hideMask();
           J.showToast('请检查您的网络连接','error');
        });
    }
})

App.page('inSale',function(){
    this.init = function(){
        $("#inSale a.submit").on('tap','',function(){
           if(!_checkForm()) return false;
           J.showMask();
           param = $('#inSale form').serialize();
           crmApi.setInSale(param,function(data){
               J.hideMask(); 
               if(data.status!=0){
                    J.showToast(data.message,'error');
               }else{
                    J.showToast('保存成功','success');
                    J.Router.goTo("#index");
               }
           },function(){
               J.hideMask();
               J.showToast('请检查您的网络连接','error');
           });
        });

      $("#Over").change(
         function () {
             if ($("#Over").val() != 2) {
                 $("#NotOkContainer").hide();
                 $("#NotOk").val("");
                 $("#ProcessContainer").hide();
                 $("#Process").val("");
                 $("#CountContainer").hide();
                 $("#discount").val("");
                 $("#num").val("");
         }
         else {
             $("#NotOkContainer").show();
             $("#ProcessContainer").show();
             // $("#NotOk").val($("#").find("option:selected").text());
         }
     });

     $("#Process").change(function () {
         if ($("#Process").val() != 4) {
             $("#CountContainer").hide();
             $("#discount").val("");
             $("#num").val("");
         }
         else {
             $("#CountContainer").show();
             // $("#NotOk").val($("#").find("option:selected").text());
         }
    });
    };

    var _checkForm = function(callback){
        var num =/^\d{1,12}(\.\d{1,4})?$/;
        if($('#Date').val()==''){
            J.showToast("日期不为空",'error');
            return false;
        }
        if($('#Boost').val()==''){
            J.showToast("推进方式不为空",'error');
            return false;
        }
        if($('#Receiver').val()==''){
            J.showToast("接待人不为空",'error');
            return false;
        }
        if($('#Over').val()==''){
            J.showToast("成交情况不为空",'error');
            return false;
        }
        if($('#Over').val()==2&&$('#NotOk').val()==''){
            J.showToast("未成交原因不为空",'error');
            return false;
        }
        if($('#Over').val()==2&&$('#Process').val()==''){
            J.showToast("处理方式不为空",'error');
            return false;
        }
        if($('#Process').val()==4&&!num.test($('#discount').val())){
            J.showToast("折扣不为数字",'error');
            return false;
        }
        if($('#Process').val()==4&&$('#discount').val()==''){
            J.showToast("折扣不为空",'error');
            return false;
        }
        return true;
    }

    this.load = function(){
        $('#inSale form')[0].reset();
        $('input[name=pid]').val(App.page("submenu").pId);
        if(!this.pid){
            return;
        }
        J.showMask();

        $("#inSale a.submit").hide();
        crmApi.getInSale(this.pid,this.sid,function(data){
            J.hideMask();
            $.each(data.result[0], function (key, value) {
                $("#" + key.replace("Step2_", "")).val(value);
            });
        },function(){
           J.hideMask();
           J.showToast('请检查您的网络连接','error');
        });
    }
})

App.page('payment',function(){
    this.init = function(){
        $("#payment a.submit").hide();
        $("#payment a.submit").on('tap','',function(){
             J.showToast('无权修改或新增','error');
           // if(!_checkForm()) return false;
           // J.showMask();
           // param = $('#payment form').serialize();
           // crmApi.setPayment(param,function(data){
           //     J.hideMask(); 
           //     if(data.status!=0){
           //          J.showToast(data.message,'error');
           //     }else{
           //          J.showToast('保存成功','success');
           //          J.Router.goTo("#index");
           //     }
           // },function(){
           //     J.hideMask();
           //     J.showToast('请检查您的网络连接','error');
           // });
        });
    };

    var _checkForm = function(callback){
        var num =/^\d{1,12}(\.\d{1,4})?$/;
        if($('#PayAmount').val()==''||!num.test($('#PayAmount').val())){
            J.showToast("应收款总额不为空或不是数字",'error');
            return false;
        }
        if($('#RealAmount').val()==''||!num.test($('#RealAmount').val())){
            J.showToast("已收款总额不为空或不是数字",'error');
            return false;
        }
        if($('#BackMoneyMode').val()==''){
            J.showToast("回款方式不为空",'error');
            return false;
        }
        if($('#BackMoney').val()==''||!num.test($('#BackMoney').val())){
            J.showToast("回款金额不为空或不是数字",'error');
            return false;
        }
        return true;
    }

    this.load = function(){
        $('#payment form')[0].reset();
        $('input[name=pid]').val(App.page("submenu").pId);
        if(!this.pid){
            return;
        }
        J.showMask();

        $("#payment a.submit").hide();
        crmApi.getPayment(this.pid,this.sid,function(data){
            J.hideMask();
            $.each(data.result[0], function (key, value) {
                $("#" + key.replace("Step4_", "")).val(value);
            });
        },function(){
           J.hideMask();
           J.showToast('请检查您的网络连接','error');
        });
    }
})
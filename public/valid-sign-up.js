$(function(){

    var isName = false;
    var isAge = false;
    var isEmail = false;
    var isPass = false;
    var isRepass = false;

    $('.submit').on('click', function(event){
        event.preventDefault();

        var name = $('#name').val();
        var age = $('#age').val();
        var email = $('#email').val();
        var password = $('#password').val();
        var rePassword = $('#rePassword').val();

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        $('.divName').removeClass('has-error');
        $('label[for="name"]').removeClass("control-label");
        $('.divAge').removeClass('has-error');
        $('label[for="age"]').removeClass("control-label");
        $('.divEmail').removeClass('has-error');
        $('label[for="email"]').removeClass("control-label");
        $('.divPass').removeClass('has-error');
        $('label[for="password"]').removeClass("control-label");
        $('.divRepass').removeClass('has-error');
        $('label[for="rePassword"]').removeClass("control-label");
        $('.registered').remove();

        //client validation
        if (name.length <= 1) {
            $('.divName').addClass('has-error');
            $('label[for="name"]').addClass("control-label");
            isName = false;
        }else{
            isName = true;
        }
        if (age.length == 0) {
            $('.divAge').addClass('has-error');
            $('label[for="age"]').addClass("control-label");
            isAge = false;
        }else{
            isAge = true;
        }
        if (!validateEmail(email)) {
            $('.divEmail').addClass('has-error');
            $('label[for="email"]').addClass("control-label");
            isEmail = false;
        }else{
            isEmail = true;
        }
        if (password.length < 6) {
            $('.divPass').addClass('has-error');
            $('label[for="password"]').addClass("control-label");
            isPass = false;
        }else{
            isPass = true;
        }
        if (password != rePassword || rePassword == "" || isPass == false) {
            $('.divRepass').addClass('has-error');
            $('label[for="rePassword"]').addClass("control-label");
            isRepass = false;
        }else{
            isRepass = true
        }

        if (isName && isAge && isEmail && isPass && isRepass) {
            $.ajax({
                url:"http://localhost:3003/sign-up",
                method:"post",
                data:{
                    name:name,
                    age:age,
                    email:email,
                    password:password,
                    rePassword:rePassword
                },
                success:function(res){
                    location.href="/"
                },
                error:function(res){
                    var response = $('<div class="registered bg-danger h3">There was a mistake, try again please!</div>');
                    $('form').append(response);
                }
            });
        }


    });

});
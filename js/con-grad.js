function Rat(_n,_m)
{
    return {type:"Rat",n:_n,m:_m};
}

function norm(x)
{
    ret=x;


    h=gcd(ret.m,ret.n);
    ret.m=ret.m/h;
    ret.n=ret.n/h;

    if(ret.m<0)
    {
        ret.m*=-1;
        ret.n*=-1;
    }

    return ret;
}

function add(x,y)
{
    if(x.type=="Vector" && y.type=="Vector")
    {
        var n = x.n;
        rett=Vector(n);


        for(var ii=0;ii<n;ii++)
        {
            rett[ii]=add(x[ii],y[ii]);
        }

        return rett;
    }


    if(x.type=="Rat" && y.type=="Rat")
    {
        ret=Rat(x.n*y.m+y.n*x.m,x.m*y.m);
        ret=norm(ret);

        return ret;
    }
}

function sub(x,y)
{
    ret=Rat(x.n*y.m-y.n*x.m,x.m*y.m);
    ret=norm(ret);
    return ret;
}

function mul(a,b)
{

    if(a.type=="Rat" && b.type=="Vector")
    {


    //alert(st(a)+" "+st(b));
        var n = b.n;
        var ret4 = Vector(n);


        for(var i=0;i<n;i++)
        {
            ret4[i]= mul(a,b[i]);
        }

        return ret4;
    }

    if(a.type=="Vector" && b.type=="Vector")
    {
        var n = a.n;
        var ret5 = Rat(0,1);
        for(var i=0;i<n;i++)
        {
            ret5=add(ret5,mul(a[i],b[i]));
        }
        return ret5;
    }

    if(a.type=="Matrix" && b.type=="Vector")
    {
        var n = a.n;
        var ret = Vector(n);
        for(var i=0;i<n;i++)
        {
            var s = Rat(0,1);
            for(var k=0;k<n;k++)
                s = add(s,mul(a[i][k],b[k]));
            ret[i]=s;
        }
        return ret;
    }

    if(a.type=="Rat" && b.type=="Rat")
    {
        ret = Rat(a.n*b.n, a.m*b.m);
        ret = norm(ret);
        return ret;
    }

    return a*b;
}

function div(a,b)
{
    ret = Rat(a.n*b.m, a.m*b.n);
    ret = norm(ret);
    return ret;
}

function gcd(a,b)
{
    while(b!=0)
    {
        var t = b;
        b=a%b;
        a=t;
    }
    return a;
}

function st(x)
{
    if(x.type=="Rat")
    {
        if(x.m==1)return x.n;
        else return x.n +"/" + x.m;
    }

    if(x.type=="Vector")
    {
        var ret="("+st(x[0]);
        for(var i=1;i<x.n;i++)
        {
            ret+=","+st(x[i]);
        }
        return ret+")";
    }

    if(x.type=="Matrix")
    {
        var ret="[";

        for(var i=0;i<x.n;i++)
        {
            ret+="("+st(x[i][0]);
            for(var j=1;j<x.n;j++)
            {
                ret+=","+st(x[i][j]);
            }
             ret+=")";
        }

        ret+="]";
        return ret;
    }

    return x;
}

function Vector(_n)
{
    var ret = [];

    for(var i=0;i<_n;i++)
        ret[i]=Rat(0,1);

    ret.type="Vector";
    ret.n=_n;

    return ret;
}


function Matrix(_n)
{
    var ret = [];

    for(var i=0;i<_n;i++)
    {
        ret[i]=[];
        for(var j=0;j<_n;j++)
            ret[i][j]=Rat(0,1);
    }

    ret.type="Matrix";
    ret.n=_n;

    return ret;
}






function begin()
{
    var n = document.getElementById("n").value


    var fA = document.getElementById("A")
    var s="A=<br>"

    for (var i=0;i<n;i++)
    {
        for (var j=0;j<n;j++)
            s+="<input id='A"+i+j+"' value='1'>"
        s+="<br>"
    }

    fA.innerHTML = s;



    var fb = document.getElementById("b")
    var s="b=<br>"

    for (var i=0;i<n;i++)
    {
        s+="<input id='b"+i+"' value='1'>"
    }

    fb.innerHTML = s;

    var fx0 = document.getElementById("x0")
    var s="x0=<br>"

    for (var i=0;i<n;i++)
    {
        s+="<input id='x0"+i+"' value='1'>"
    }

    fx0.innerHTML = s;

    if(n==3)
    {
        document.getElementById("A00").value=3;
        document.getElementById("A01").value=-1;
        document.getElementById("A02").value=1;
        document.getElementById("A10").value=-1;
        document.getElementById("A11").value=3;
        document.getElementById("A12").value=-1;
        document.getElementById("A20").value=1;
        document.getElementById("A21").value=-1;
        document.getElementById("A22").value=3;

        document.getElementById("b0").value=-1;
        document.getElementById("b1").value=-1;
        document.getElementById("b2").value=0;

        document.getElementById("x00").value=0;
        document.getElementById("x01").value=1;
        document.getElementById("x02").value=0;
    }

}

function solve()
{
    var n = document.getElementById("n").value
    var ans=""

    x=[];
    fx=[];
    alpha=[];
    betha=[];
    s=[];

    A=Matrix(n);
    for(var i=0;i<n;i++)
        for(var j=0;j<n;j++)
        A[i][j]=
            Rat(document.getElementById("A"+i+j).value,1);

    b=Vector(n);
    for(var i=0;i<n;i++)b[i]=
        Rat(document.getElementById("b"+i).value,1);

    x[0]=Vector(n);
    for(var i=0;i<n;i++)x[0][i]=
        Rat(document.getElementById("x0"+i).value,1);


    ans+= "f = ½ (x, A x) + b x <br>";

    ans+="A="+st(A)+"<br>";
    ans+="b="+st(b)+"<br>";
    ans+="x<sub>0</sub>="+st(x[0])+"<br>";

    ans+="<br>Solution:<br>"

    for(var kk=1;kk<=2*n;kk++)
    {
        ans+="<br>k="+kk+"<br>";

        fx[kk-1]=add(mul(A,x[kk-1]),b);
        ans+="f<sub>x</sub>(x<sub>"+(kk-1)+"</sub>)="+st(fx[kk-1])+"<br>";

        var ww = mul(fx[kk-1],fx[kk-1]);

        if(ww.n==0)
        {
            ans+="Solution found.<br>";
            ans+="x<sup>*</sup> = " + st(x[kk-1])+"<br>";

            var xx = x[kk-1];
            var t1 = mul(xx, mul(A,xx));
            var t2 = mul(b,xx);
            var ff = add(mul(Rat(1,2),t1),t2);
            ans+= "f<sup>*</sup> = ½ (x<sup>*</sup>, A x<sup>*</sup>) + b x<sup>*</sup> = " + st(ff);

            break;
        }


        if(kk==1)
        {
            s[1] = mul(Rat(-1,1),fx[0]);
            ans+="s<sub>1</sub>=-f<sub>x</sub>(x<sub>0</sub>)=" + st(s[1])+ "<br>";
        }
        else
        {

            var t1 = mul(A,s[kk-1]);
            var t2= mul(s[kk-1],t1);
            var t3 = mul(fx[kk-1],t1);
            betha[kk-1]=div(t3,t2);
            ans+="β<sub>"+(kk-1)+"</sub> = [f<sub>x</sub>(x<sub>"+(kk-1)+"</sub>) A s<sub>"+(kk-1)+"</sub>]/[s<sub>"+(kk-1)+"</sub> A s<sub>"+(kk-1)+"</sub>]="+ st(betha[kk-1])+"<br>";

            s[kk] = add(mul(Rat(-1,1),fx[kk-1]),mul(betha[kk-1],s[kk-1]));
            ans+="s<sub>" +kk +"</sub>=-f<sub>x</sub>(x<sub>"+(kk-1)+"</sub>)+β<sub>"+(kk-1)+"</sub>s<sub>"+(kk-1)+"</sub>=" + st(s[kk])+ "<br>";
        }

        var t1 = mul(A,s[kk]);
        var t2 = mul(s[kk],t1);
        var t3 = mul(fx[kk-1],s[kk]);
        alpha[kk] = mul(Rat(-1,1),div(t3,t2));
        ans+="α<sub>"+kk+"</sub> = -[f<sub>x</sub>(x<sub>"+(kk-1)+"</sub>), s<sub>"+kk+"</sub>]/[s<sub>"+kk+"</sub> A s<sub>"+kk+"</sub>] = " + st(alpha[kk])+"<br>";


        x[kk]=add(x[kk-1],mul(alpha[kk],s[kk]));
        ans+="x<sub>"+kk+"</sub> = x<sub>"+(kk-1)+"</sub> + α<sub>"+kk+"</sub>s<sub>"+kk+"</sub> = " + st(x[kk])+"<br>";


    }


    document.getElementById("solution").innerHTML = ans;
}
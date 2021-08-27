const gen = document.getElementById("generate");
const clear = document.getElementById("clear");
const txtExpr = document.getElementById("txtExpression");
const divTable = document.getElementById("table");
const btnOperation = document.querySelectorAll(".operation");

btnOperation.forEach(btn => {
    btn.addEventListener('click', ()=>{
        txtExpr.value = txtExpr.value + btn.innerText;
        txtExpr.focus();
    });
});

const operators = {
    1:"~", //not
    2:"^", //and
    3:"ⱽ", //or
    4:"→", //if-then (->)
    5:"↔" //if and only if (=)
}
window.addEventListener('load', generateTable);
gen.addEventListener('click', generateTable);
clear.addEventListener('click', ()=>{txtExpr.value = ''});
function generateTable(){
    if(txtExpr.value.trim() != ''){
        if(divTable.lastElementChild) divTable.removeChild(divTable.lastElementChild);
        let expr = normalizeExpression(txtExpr.value.trim());
        let props = getPropositions(expr);
        let headers = [];
        props.forEach(prop =>{
            headers.push(newElement('th',[],prop,{scope:"col"}))
        });
        expr = expr.split(',');
        // console.log(expr);
        expr.forEach(elem => {
            headers.push(newElement('th',[],elem,{scope:"col"}));

        });
        let row = newElement('tr', headers)
        let head = newElement('thead',[row]);

        //values
        //determine how many rows
        //create rows

        let cases = Math.pow(2,props.length);
        let rows = [];
        for(let caseNo = cases-1; caseNo >= 0 ; caseNo--){
            let cells = [];
            headers.forEach(header => {
                // console.log(props);
                caseValue = evaluate(caseNo, props, convertToPostfix(header.innerText));
                // caseValue = evaluate(3, props, convertToPostfix(header.innerText));
                cells.push(newElement('td','',caseValue,{class:caseValue.toString()}));

            }); 
            let elrow = newElement('tr',cells);
            rows.push(elrow);  
        }
        
        let body = newElement('tbody', rows);
        let table = newElement('table', [head,body],'',{border:1});
        divTable.appendChild(table);
        // console.log(convertToPostfix(expr));
    }
}

function getPropositions(expr){
    // console.log(expr);
    let props = [];
    let regexp = /[a-z]/;
    for(let i=0; i < expr.length; i++){
        let currChar = expr.charAt(i);
        if(currChar.match(regexp) && !props.includes(currChar)){
                props.push(currChar);
            // console.log(currChar);
        }


    }
    return props;
}

function normalizeExpression(expr){
    expr = expr.replaceAll("<->", operators[5]);
    expr = expr.replaceAll("->", operators[4]);
    expr = expr.replaceAll("v", operators[3]);
    expr = expr.replaceAll(" ", "");
    return expr;
}

function newElement(tag='div',  children=[], innerText='', attributes={}){
    let elem = document.createElement(tag);
    elem.innerText = innerText;
    if(children.length > 0){
        children.forEach((child) => {
            elem.appendChild(child);
        });
    }
    if(Object.keys(attributes).length > 0){
        for (let attribute of Object.keys(attributes)) {
            elem.setAttribute(attribute, attributes[attribute]);
        }
        // console.table(attributes);
    }
    return elem;
}

function evaluate(caseNo = 0, props = [], expr = []){
    //convert caseNo to binary
    let binary = caseNo.toString(2);
    binary = String(binary).padStart(props.length, '0');
    // console.log(binary);
    //assign value to props
    let propsValue = {}
    // console.log(binary.charAt(0));
    for(let i=0; i<props.length; i++){
        // console.log(binary.charAt(i));
        propsValue[props[i]] = binary.charAt(i);
    }
    // console.log(propsValue);
    //evaluate expression

    let temp = 0, dbl = 0, operand1, operand2;
    let operand = [];

//        Stack<String> operator = new Stack();
    for (let i = 0; i < expr.length; i++) {
        if(isOperator(expr[i])){
            if(expr[i] == operators[1]){ //if operator is negation, perform single pop()
                operand1 = operand.pop();
                operand.push(compute(expr[i], operand1));
            }else{
                operand1 = operand.pop();
                operand2 = operand.pop();
                operand.push(compute(expr[i], operand1, operand2));
            }
        }
        else{
            //push the boolean value
            let booleanVal = propsValue[expr[i]]==1?true:false;
            // console.log("bool:" + booleanVal + " expr: "+propsValue[expr[i]] );
            operand.push(booleanVal);

        }
    }
    return operand.pop();
    // return expr;
}


function compute(operator='', operand1=false, operand2=false){
    // 1:"~", //not
    // 2:"^", //and
    // 3:"ⱽ", //or
    // 4:"→", //if-then (->)
    // 5:"↔" //if and only if (=)
    switch (operator) {
        case operators[1]:
            return !operand1;
        case operators[2]:
            return operand1 && operand2;
        case operators[3]:
            return operand1 || operand2;
        case operators[4]:
            return operand1 || !operand2;
        case operators[5]:
            return operand1 == operand2;    
    }    
}

function convertToPostfix(infixExpression = ''){
    let postfixExpression = [];
    infixExpression = explode(infixExpression);
    console.log(infixExpression);
    let operator = [];
    infixExpression.forEach((element) => {
        if(isOperator(element)){
            if(operator.length == 0){
                operator.push(element);
            }
            
            else if(operators[element] >  operators[operator[operator.length-1]]){
                while(operators[element] >  operators[operator[operator.length-1]]){
                    postfixExpression.push(operator.pop());
                    if(operator.length == 0) break;
                }
                operator.push(element);
            }
            else operator.push(element);
        }
        else if(element=="("){
            operator.push(element);
        }
        else if(element==")"){
            while(operator[operator.length-1] !="("){
                console.log('popping from operator stack: ' + operator[operator.length-1])
                postfixExpression.push(operator.pop());
            }
            // console.log('popping from operator stack: ' + operator[operator.length-1])
            if(operator.length != 0)operator.pop();
            if(operator[operator.length-1] == operators[1]){
                postfixExpression.push(operator.pop());
            }
        }
        else{
            postfixExpression.push(element);
            if(operator[operator.length-1] == operators[1]){
                postfixExpression.push(operator.pop());
            }
        }
    });
    while(operator.length != 0){
        postfixExpression.push(operator.pop());
    }
    postfixExpression.filter(elem => {
        elem != '(' && elem != ')'
    });
    console.log(postfixExpression);
    return postfixExpression;
}

function explode(expression = ''){
    let ret = [];
    for(let i = 0; i < expression.length; i++){
        ret.push(expression.charAt(i));
    }
    return ret;
}

function isOperator(char){
    return Object.values(operators).includes(char);
}

import axios from "axios";
import querystring from "querystring";

export default {

    axioscall: async function (params) {
        let result;
             await axios({
               method:"POST",
               url:"https://api.taggun.io/api/receipt/v1/verbose/url",
               headers:{
                 "Content-Type":"application/json",
                 "apikey":"ab7591d0fabe11e98bfadfb7eb1aa8b5"
               },
               data:{
                 url:params
               }
               }).then((params)=> {
                 result=params.data.text.text;
               })
               .catch((error)=>{
                 console.log(error)
               })
               return axios( {
                method: 'post',
                headers:{
                  "Content-Type":"application/x-www-form-urlencoded"
                },
                url: "https://api.spoonacular.com/food/detect?apiKey=58cfd4a9c5d74b4b8a81d26ef617114f", 
                data: querystring.stringify({
                text:result
                })
              })
           }
};
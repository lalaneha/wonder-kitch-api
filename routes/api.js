import axios from "axios";
import querystring from "querystring";

export default {

    
  recipeIngrediants: function (req) {
    return axios( {
      method: 'GET',
      headers:{
        "Content-Type":"application/octet-stream"
      },
      url: "https://api.spoonacular.com/recipes/findByIngredients?apiKey=58cfd4a9c5d74b4b8a81d26ef617114f", 
      params:{
        ingredients:req
        }
      })    
  },

  recipeSearch: function (req) {
    return axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/search",
      params:{
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
        number: 100,
        query: req,
        instructionsRequired: true
        }   
      })    
  },

  recipeNutrition: function (req) {
    return axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/"+req+"/information",
      params:{
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
        id: req,
        includeNutrition: true
        }   
      })    
  },

  question: function (req) {
    return axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/quickAnswer",
      params:{
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
        q: req
        }   
      })    
  },

  steps: function (req) {
    return axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/"+req+"/analyzedInstructions",
      params:{
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
        id: req,
        stepBreakdown: true
      }   
      })    
  },
  
  takePicture: async function (req) {
    let result;
    const data = new FormData()
  data.append('file', req)
     await axios({
       method:"POST",
       url:"https://api.taggun.io/api/receipt/v1/verbose/file",data,
       headers:{
         "Content-Type": "application/x-www-form-urlencoded",
         "apikey":"ab7591d0fabe11e98bfadfb7eb1aa8b5",
         "processData": false,
         "contentType": false,
         "mimeType": "multipart/form-data"
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
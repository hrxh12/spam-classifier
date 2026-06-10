#Flask python mein api banane k lib
#request user ka bheja hua data lene k liye
#jsonify response ko json format mein dene k liye
from flask import Flask,request,jsonify

import pickle

from src.preprocess import preprocess_predict

# pickle = saved model load karne ke liye
import pickle

# os = file paths ke liye                          
import os                                          

# sys = Python ko batana hai src folder kahan hai  
import sys                                         

# src folder ko path mein add karo                 
# taaki preprocess.py import ho sake               
sys.path.append(os.path.join(                      
    os.path.dirname(__file__), "src"))             

# preprocess_predict import karo                   
from preprocess import preprocess_predict

#Flask app ka obj banao
#__name__=current file ka name
app= Flask(__name__)

model=pickle.load(open("model/spam_model.pkl","rb"))

#API route 
#/predict =url endpoint
#methods=["POST"]=POST request send karega
@app.route("/predict",methods=["POST"])
def predict():
    #user ka bheja hua json data lo
    data=request.json

    #message extract kro
    message=data["message"]

    #messages ko number mein badlo
    X=preprocess_predict(message)
    result=model.predict(X)

    prediction="SPAM" if result[0]==1 else "NOT SPAM"

    #JSON response return karo
    
    return jsonify({
        "message":message,
        "prediction":prediction
    })

# app run karo
# debug=True = code change hone pe auto restart
if __name__== "__main__":
    app.run(debug=True)

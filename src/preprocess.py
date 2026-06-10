from sklearn.feature_extraction.text import CountVectorizer #CountVectorizer text ko number mein badlta
import pickle #python object ko file mein save krne k liye
import os                                                    
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  

def preprocess_train(messages):
    #countvectorizer ka obj banao
    #ye har unique word ko ek no. deta hai
    cv=CountVectorizer()
    
    #fit_transform do kaam krta hai
    #fit har word ko seekhta and no. deta
    # transform messages ko no. mein badalta
    X=cv.fit_transform(messages)

    #vectorizer ko file mein save kro 
    #wb=write binary code
    pickle.dump(cv, open("../model/vectorizer.pkl", "wb"))

    #X=numbers waala data(input for model)
    #cv=vectorizer object(saved for later)
    return X,cv

def preprocess_predict(message):

    #saved vectorizer load krra
    #root se path lo taaki app.py bhi kaam kare  # NEW
    cv=pickle.load(open(os.path.join(root,"model/vectorizer.pkl"),"rb"))  # NEW

    #sirf transform no save
    #sir training waale words ko match kro
    X=cv.transform([message])

    #numbers waala message return kro
    return X
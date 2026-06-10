import pickle

from preprocess import preprocess_predict

model=pickle.load(open("../model/spam_model.pkl","rb"))


def predict(message):
    #message ko numnbers mein badlo
    #same vectorizer use hoga jo training mein tha
    X=preprocess_predict(message)

    #model se predict kaho
    result=model.predict(X)

    if result[0]==1:
        return "spam"
    else:
        return"not spam"
#my testcases
print(predict("Win free money now"))
print(predict("See you at lunch"))
print(predict("Claim your free gift today"))
print(predict("Hope you are doing well"))
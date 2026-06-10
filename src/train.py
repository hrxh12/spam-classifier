#pandas=data load krne k liye
import pandas as pd

#pickle=model ko file mein save krne k liye
import pickle

 #preprocess_train=humara function whic i made
 #jo text ko no. mein badalti
from preprocess import preprocess_train

#multinomialNB=Naive Bayes Algorithm
#yeh spam classifier ka actual brain hai
from sklearn.naive_bayes import MultinomialNB


# train test split karo
# 80% training, 20% testing
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

#graphs banane ke liye
import matplotlib.pyplot as plt

# encoding="latin-1" kyun? → spam.csv mein special characters hain
# jo normal utf-8 se nahi padhte
#CSV file se data load kro
df=pd.read_csv("../data/spam.csv",encoding="latin-1")

# spam.csv mein 5 columns hain → sirf v1 aur v2 chahiye  
# v1=label(spam/ham) v2=message(actual text)              
df=df[["v1","v2"]] 

# v1 aur v2 confusing names hain → rename karo           
# v1 → label, v2 → message                               
df.columns=["label","message"]     

# model text nahi samjhta → numbers chahiye               # NEW
# ham → 0 (normal message)                                # NEW
# spam → 1 (spam message)                                 # NEW
df["label"]=df["label"].map({"ham":0,"spam":1})

#df["messages"] sirf message column lo
X,cv=preprocess_train(df["message"])

#label column lo
y=df["label"]

model=MultinomialNB()

#model train kro 
#X=input(numbers)
#y=output(spam or not)
#model.fit(X,y)

# data split karo
X_train, X_test, y_train, y_test=train_test_split(
    X,y,
    test_size=0.2, # 20% testing ke liye
    random_state=42 # same split hamesha
)

#sirf training data pe train karo
model.fit(X_train, y_train)

# test data pe predict karo
y_pred=model.predict(X_test)

#trained model ko file mein save kro

pickle.dump(model, open("../model/spam_model.pkl","wb"))

print("Trained and saved")
print(f"Accuracy:{accuracy_score(y_test,y_pred)*100:.2f}%")
print(classification_report(y_test,y_pred,
    target_names=["Not Spam","Spam"]))

#graph 1
labels=["not Spam","Spam"]
counts=[len(y[y==0]),len(y[y==1])]

plt.bar(labels, counts, color=["green", "red"])
plt.title("Spam vs Not Spam Distribution")
plt.xlabel("category")
plt.ylabel("count")
plt.savefig("../notebooks/spam_distribution.png")
plt.show()
print("Graph saved")
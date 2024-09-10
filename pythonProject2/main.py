from tkinter import *
from tkinter import ttk
from PIL import Image,ImageTk
import random


class Bill_App:
    def __init__(self,root):
        self.root=root
        self.root.geometry("1530x800+0+0")
        self.root.title("Billing Software ")

        # Variables
        self.c_name=StringVar()
        self.c_phone=StringVar()
        self.bill_no=StringVar()
        z = random.randint(1000,9999)
        self.bill_no.set(z)
        self.c_email=StringVar()
        self.search_bill=StringVar()
        self.product=StringVar()
        self.prices=IntVar()
        self.qty=IntVar()
        self.sub_total=StringVar()
        self.tax_input=StringVar()
        self.total= StringVar()



        # Product Categories list
        self.Category=["Select Option","Clothing","Lifestyle","Mobiles"]

        self.SubCatClothing=["pant","T-shirt","Shirt"]
        self.pant=["Levis","Locomotive","USPolo"]
        self.price_Levis= 5000
        self.price_Locomotive= 1000
        self.price_USPolo= 2500

        self.T_shirt=["USPOLO","Roadster","Jack&Jones"]
        self.price_USPolo=2000
        self.price_Roadster=1500
        self.price_JackJones=2000

        self.Shirt=["Peter England","Louis Phillipe","park Avenue"]
        self.price=Peter=2200
        self.price_Louis=2400
        self.price_Park=1999

        # subCatLifestyle
        self.SubCatLifestyle=["Bath soap","Face wash","hair oil"]
        self.Bath_soap=["LifeBoy","Lux","Wildstone","Santoor"]
        self.price_life=float(30)
        self.price_Lux=40
        self.price_Wildstone=50
        self.price_Santoor=35

        self.Face_wash=["Beardo","Nivea","Ponds","Himalya"]
        self.price_Beardo=450
        self.price_Nivea=350
        self.price_Ponds=300
        self.price_Himalya=325

        self.Hair_oil=["Parachute","Jasmine","Bajaj"]
        self.price_para=30
        self.price_jasmine=30
        self.price_bajaj=30


        # SubCatMobiles
        self.SubCatMobiles=["OnePlus","Iphone","Samsung","Xiome",]
        self.OnePlus=["OnePlus_Nord","OnePlus_9R"," OnePlus_8"]
        self.price_OneNord=30000
        self.price_One9R =40000
        self.price_One8=38000

        self.Iphone=[" Iphone_X","Iphone_11","Iphone_12 "]
        self.price_iX=32000
        self.price_i11=49000
        self.price_i12=65000

        self.Samsung = ["Samsung M16", "Samsung M12", " Samsung M21"]
        self.price_sm16 = 16000
        self.price_sm12 = 18000
        self.price_sm21 = 20000

        self.Xiome=["red11","Redme-12","RedmePro"]
        self.price_r11=16000
        self.price_r12=17500
        self.price_rpro=20000






     # image 1
        img=Image.open("image/b1.jpg")
        img=img.resize((500,130),Image.ANTIALIAS)
        self.photoimg=ImageTk.PhotoImage(img)
        lb1_img=Label(self.root,image=self.photoimg)
        lb1_img.place(x=0,y=0,width=500,height=130)



    # image 2
        img1= Image.open("image/spy1.jpg")
        img1= img1.resize((500, 130), Image.ANTIALIAS)
        self.photoimg1 = ImageTk.PhotoImage(img1)
        lb1_img1= Label(self.root, image=self.photoimg1)
        lb1_img1.place(x=500, y=0, width=500, height=130)



    # image 3
        img2= Image.open("image/spy2.jpg")
        img2= img2.resize((500, 130), Image.ANTIALIAS)
        self.photoimg2= ImageTk.PhotoImage(img2)
        lb1_img2 = Label(self.root, image=self.photoimg2)
        lb1_img2.place(x=1000, y=0, width=500, height=130)
        lbl_title=Label(self.root,text=" BILLING SOFTWARE",font=("times new roman",35,"bold"),bg="white",fg="red")
        lbl_title.place(x=0,y=130,width=1530,height=45)


        Main_Frame=Frame(self.root,bd=5,relief=GROOVE,bg="white")
        Main_Frame.place(x=0,y=175,width=1530,height=620)



        # Customer LabelFrame
        Cust_Frame=LabelFrame(Main_Frame,text="Customer",font=("times new roman",12,"bold"),bg="white",fg="green")
        Cust_Frame.place(x=10,y=5,width=350,height=140)
        self.lbl_mob = Label(Cust_Frame, text="Mobile no.", font=("times new roman", 12, "bold"), bg="white", fg="blue2")
        self.lbl_mob.grid(row=0,column=0,stick=W,padx=5,pady=2)
        self.entry_mob=ttk.Entry(Cust_Frame,textvariable=self.c_phone,font=("times new roman", 12, "bold"),width=22)
        self.entry_mob.grid(row=0,column=1)

        self.lblCustName=Label(Cust_Frame,font=('arial',12,'bold'),bg="white",text="Customer name",bd=4,fg='blue')
        self.lblCustName.grid(row=1,column=0,sticky=W,padx=5,pady=2)
        self.txtCustName=ttk.Entry(Cust_Frame,textvariable=self.c_name,font=("arial",10,"bold"),width=24)
        self.txtCustName.grid(row=1,column=1,sticky=W,padx=5,pady=2)

        self.lblEmail=Label(Cust_Frame,font=('arial',12,'bold'),bg="white",text="email",bd=4,fg='blue')
        self.lblEmail.grid(row=2,column=0,sticky=W,padx=5,pady=2)
        self.txtEmail=ttk.Entry(Cust_Frame,textvariable=self.c_email,font=("arial",10,"bold"),width=24)
        self.txtEmail.grid(row=2,column=1,sticky=W,padx=5,pady=2)

        # Product LabelFrame
        Product_Frame = LabelFrame(Main_Frame, text="Product", font=("times new roman", 12, "bold"), bg="white",fg="green")
        Product_Frame.place(x=370, y=5, width=620, height=140)



        # Category

        self.lblCategory = Label(Product_Frame, font=('arial', 12, 'bold'), bg="white", text="Select Categories", bd=4, fg='blue')
        self.lblCategory.grid(row=0, column=0, sticky=W, padx=5, pady=2)
        self.Combo_Category=ttk.Combobox(Product_Frame,value=self.Category,font=('arial',10,'bold'),width=24,state='readonly')
        self.Combo_Category.current(0)
        self.Combo_Category.grid(row=0,column=1,sticky=W,padx=5,pady=2)
        self.Combo_Category.bind("<<ComboboxSelected>>",self.Categories)


        # SubCategory
        self.lblSubCategory = Label(Product_Frame, font=('arial', 12, 'bold'), bg="white", text="Subcategory", bd=4,
                                 fg='blue')
        self.lblSubCategory.grid(row=1, column=0, sticky=W, padx=5, pady=2)
        self.ComboSubCategory = ttk.Combobox(Product_Frame,value = [""], state='readonly',font=('arial', 10, 'bold'), width=24 )
        self.ComboSubCategory.grid(row=1, column=1, sticky=W, padx=5, pady=2)
        self.ComboSubCategory.bind("<<ComboboxSelected>>",self.Product_add)


        # Product Name
        self.lblproduct = Label(Product_Frame, font=('arial', 12, 'bold'), bg="white", text="Product Name ", bd=4, fg='blue')
        self.lblproduct.grid(row=2, column=0, sticky=W, padx=5, pady=2)
        self.ComboProduct = ttk.Combobox(Product_Frame,textvariable=self.product,state='readonly', font=('arial', 10, 'bold'), width=24, )
        self.ComboProduct.grid(row=2, column=1, sticky=W, padx=5, pady=2)
        self.ComboProduct.bind("<<ComboboxSelected>>",self.price)


        # price
        self.lblPrice= Label(Product_Frame, font=('arial', 12, 'bold'), bg="white", text="Price ", bd=4,fg='blue')
        self.lblPrice.grid(row=0, column=2, sticky=W, padx=5, pady=2)
        self.ComboPrice = ttk.Combobox(Product_Frame, textvariable=self.prices,font=('arial', 10, 'bold'), width=24, state='readonly')
        self.ComboPrice.grid(row=0, column=3, sticky=W, padx=5, pady=2)


        # Qty
        self.lblQty = Label(Product_Frame, font=('arial', 12, 'bold'), bg="white", text="Qty ", bd=4,fg='blue')
        self.lblQty.grid(row=1, column=2, sticky=W, padx=5, pady=2)
        self.ComboQty = ttk.Entry(Product_Frame,textvariable=self.qty, font=('arial', 10, 'bold'), width=26, state='readonly')
        self.ComboQty.grid(row=1, column=3, sticky=W, padx=5, pady=2)

        # Middle Frame
        MiddleFrame=Frame(Main_Frame,bd=10)
        MiddleFrame.place(x=10,y=150,width=980,height=340)
        # image 1



        img12= Image.open("image/mall3.jpg")
        img12= img12.resize((490, 340), Image.ANTIALIAS)
        self.photoimg12 = ImageTk.PhotoImage(img12)

        lb1_img12 = Label(MiddleFrame, image=self.photoimg12)
        lb1_img12.place(x=0, y=0, width=500, height=340)
        # image 2

        img13 = Image.open("image/mall2.jpg")
        img13 = img13.resize((490, 340), Image.ANTIALIAS)
        self.photoimg13 = ImageTk.PhotoImage(img13)

        lb1_img13= Label(MiddleFrame, image=self.photoimg13)
        lb1_img13.place(x=490, y=0, width=500, height=340)






        # search
        Search_Frame = Frame(Main_Frame, bd=2, bg="white")
        Search_Frame.place(x=1020, y=15,width=500,height=40)

        self.lblBill = Label(Search_Frame, font=('arial', 12, 'bold'),  text="Bill Number   ", bg="red",fg='white',width=10)
        self.lblBill.grid(row=0, column=0, sticky=W, padx=1)

        self.txt_Entry_Search = ttk.Entry(Search_Frame, textvariable=self.search_bill,font=('arial', 12, 'bold'))
        self.txt_Entry_Search.grid(row=0, column=1, sticky=W, padx=2)

        self.BtnSearch = Button(Search_Frame,  text="Search", font=("arial", 12, 'bold'), bg="orangered", fg="white")
        self.BtnSearch.grid(row=0, column=2)

        #rightFrame Bill area
        RightLabelFrame=LabelFrame(Main_Frame,text="Bill Area",font=("times new roman", 12, "bold"), bg="white",
                                fg="green")
        RightLabelFrame.place(x=1000,y=45,width=480,height=440)

        scroll_y=Scrollbar(RightLabelFrame,orient=VERTICAL)
        self.textarea=Text(RightLabelFrame,yscrollcommand=scroll_y.set,bg="white",fg="black",font=("times new roman", 12, "bold"))
        scroll_y.pack(side=RIGHT,fill=Y)
        scroll_y.config(command=self.textarea.yview)
        self.textarea.pack(fill=BOTH,expand=1)




        # Bill counter Label_Frame
        Bottom_Frame = LabelFrame(Main_Frame, text="Bill Counter", font=("times new roman", 12, "bold"), bg="white",fg="green")
        Bottom_Frame.place(x=0, y=485, width=1520, height=125)
        self.lblSubTotal= Label(Bottom_Frame, font=('arial', 12, 'bold'), bg="white", text="Sub Total  ", bd=4, fg='blue')
        self.lblSubTotal.grid(row=0, column=0, sticky=W, padx=5, pady=2)
        self.EntrySubTotal = ttk.Entry(Bottom_Frame, font=('arial', 10, 'bold'), width=26)
        self.EntrySubTotal.grid(row=0, column=1, sticky=W, padx=5, pady=2)
        self.lbl_tax = Label(Bottom_Frame, font=('arial', 12, 'bold'), bg="white", text="Gov Tax  ", bd=4,fg='blue')
        self.lbl_tax.grid(row=1, column=0, sticky=W, padx=5, pady=2)
        self.txt_tax = ttk.Entry(Bottom_Frame, font=('arial', 10, 'bold'), width=26)
        self.txt_tax.grid(row=1, column=1, sticky=W, padx=5, pady=2)
        self.lblAmountTotal= Label(Bottom_Frame, font=('arial', 12, 'bold'), bg="white", text="Total  ", bd=4, fg='blue')
        self.lblAmountTotal.grid(row=2, column=0, sticky=W, padx=5, pady=2)
        self.txtAmountTotal = ttk.Entry(Bottom_Frame, font=('arial', 10, 'bold'), width=26)
        self.txtAmountTotal.grid(row=2, column=1, sticky=W, padx=5, pady=2)


        # Button Frame
        Btn_Frame=Frame(Bottom_Frame,bd=2,bg="white")
        Btn_Frame.place(x=320,y=0)


        self.BtnAddToCart=Button(Btn_Frame,height=2,text="Add To Cart",font=("arial",15,'bold'),bg="orangered",fg="white",width=15,cursor="hand2")
        self.BtnAddToCart.grid(row=0,column=0)
        self.Btngenerate_bill = Button(Btn_Frame, height=2, text="Generate Bill", font=("arial", 15, 'bold'), bg="orangered",fg="white",width=15,cursor="hand2")
        self.Btngenerate_bill.grid(row=0, column=1)

        self.Save = Button(Btn_Frame,height=2, text="Save Bill", font=("arial", 15, 'bold'), bg="orangered",fg="white",width=15,cursor="hand2")
        self.Save.grid(row=0, column=2)

        self.BtnPrint = Button(Btn_Frame, height=2, text="Print Bill", font=("arial", 15, 'bold'), bg="orangered",fg="white",width=15,cursor="hand2")
        self.BtnPrint.grid(row=0, column=3)

        self.BtnClear = Button(Btn_Frame, height=2, text="Clear", font=("arial", 15, 'bold'), bg="orangered",fg="white",width=15,cursor="hand2")
        self.BtnClear.grid(row=0, column=4)

        self.BtnExit= Button(Btn_Frame, height=2, text="Exit", font=("arial", 15, 'bold'), bg="orangered",fg="white",width=15,cursor="hand2")
        self.BtnExit.grid(row=0, column=5)


    def Categories(self,event=""):
        if self.Combo_Category.get()=="Clothing":
            self.ComboSubCategory.config(value=self.SubCatClothing)
            self.ComboSubCategory.current(0)

        if self.Combo_Category.get() == "Lifestyle":
            self.ComboSubCategory.config(value=self.SubCatLifestyle)
            self.ComboSubCategory.current(0)

        if self.Combo_Category.get()=="Mobiles":
            self.ComboSubCategory.config(value=self.SubCatMobiles)
            self.ComboSubCategory.current(0)


    def Product_add(self,event=""):
        if self.ComboSubCategory.get()=="pant":
            self.ComboProduct.config(value=self.pant)
            self.ComboProduct.current(0)
        if self.ComboSubCategory.get()=="T-shirt":
            self.ComboProduct.config(value=self.T_shirt)
            self.ComboProduct.current(0)
        if self.ComboSubCategory.get()=="Shirt":
            self.ComboProduct.config(value=self.Shirt)
            self.ComboProduct.current(0)


        # lifestyle
        if self.ComboSubCategory.get()=="Bath soap":
            self.ComboProduct.config(value= self.Bath_soap)
            self.ComboProduct.current(0)

        if self.ComboSubCategory.get() == "Face wash":
            self.ComboProduct.config(value=self.Face_wash)
            self.ComboProduct.current(0)

        if self.ComboSubCategory.get() == "hair oil":
            self.ComboProduct.config(value=self.Hair_oil)
            self.ComboProduct.current(0)

        # Mobile

        if self.ComboSubCategory.get()=="OnePlus":
            self.ComboProduct.config(value=self.OnePlus)
            self.ComboProduct.current(0)
        if self.ComboSubCategory.get()=="Iphone":
            self.ComboProduct.config(value=self.Iphone)
            self.ComboProduct.current(0)

        if self.ComboSubCategory.get()=="Samsung":
            self.ComboProduct.config(value=self.Samsung)
            self.ComboProduct.current(0)
        if self.ComboSubCategory.get()=="Xiome":
            self.ComboProduct.config(value=self.Xiome)
            self.ComboProduct.current(0)

    def price(self,event=""):
        if self.ComboProduct.get()== "Levis":
            self.ComboPrice.config(value=self.price_Levis)
            self.ComboPrice.current(0)
            self.qty.set(1)







if __name__=='__main__':
    root=Tk()
    obj=Bill_App(root)
    root.mainloop()
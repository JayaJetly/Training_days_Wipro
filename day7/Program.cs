class ABC {

   public static void  Invoice()
    { 
    // definition
    }
     //Single Cast Delegate
    public static void Print1(int a, int b) { }
   
    public delegate void MyShow(); //  this delegate will point to a method
    public delegate void Printing();
    public delegate void Admin(); // Declaring a delegate

    static void Main(String[] args)
    {

        MyShow my = new MyShow(Show);
        Printing my1 = new Printing(Print);
        Admin a = new Admin(Invoice);// Calling a Delegate
    }

    public static void Show()
    {
        Console.WriteLine("Show method called using Delegate");

    }
    public static void Print() {
        Console.WriteLine("Print method called using Delegate"); 
    
    }


}

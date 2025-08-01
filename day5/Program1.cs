 public class Father
{ 

 
    public void FatherDetails()
    {
        Console.WriteLine("Father Details :");

    }
}
public class Person : Father
{
    //properties 
    protected string Name { get; set; }
    public virtual void Display()
    {
        Console.WriteLine("Displaying Name you entered :" + Name);
    }

    public void setName(string Name)
    {

        this.Name = name;
    }
}


public class Student : Person
{

    // public Student(string name)
    // {
    //     Name = name;
    // }
    public int RollNumber { get; set; }

    public void Study()

    { Console.WriteLine(Name + "is studying :"); }

    static void Main()
    {

        Student stud = new Student();
        //stud.Name = "Niti";
        stud.setName("Niti");
        stud.RollNumber = 2004;
        stud.FatherDetails();
        stud.Display();
        stud.Study();
    }

}


public class MainProgram
{
    static void Main()
    {

        Student stud = new Student("Niti");
        // stud.Name = "Niti";
        stud.RollNumber = 2004;
        stud.Display();
        stud.Study();
    }
}
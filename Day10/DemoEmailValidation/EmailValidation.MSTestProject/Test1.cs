using Microsoft.VisualStudio.TestTools.UnitTesting;
using DemoEmailValidation;
    namespace EmailValidation.MSTestProject
{
    [TestClass]
    public class Test1
    {
        private EmailValidator validator;
        [TestInitialize]
        public void TestMethod1()
        {
            validator = new EmailValidator();
        }
        [TestMethod]

        public void IsNotValid()
        {
            string input = "Invalid_email.com";
            bool result = validator.IsEmailValid(input);
            Assert.IsFalse(result);
        }
        [TestMethod]

        public void IsValid()
        {
            string input = "Valid@example.com";
            bool result = validator.IsEmailValid(input);
            Assert.IsTrue(result);
        }

    }
            
                
    
}

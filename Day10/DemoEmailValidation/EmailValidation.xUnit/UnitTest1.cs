using System.ComponentModel.DataAnnotations;
using Xunit;
namespace EmailValidation.xUnit
{
    public class UnitTest1
    {
        private readonly EmailValidator validator = new EmailValidator();
        [Fact]
        public void IsNotValid()
        {
            string input = "no-at-symbol.com";
            bool result = Validator.IsEmailValid(input);
            Assert.False(result);

        }
        [Fact]
        public void IsValid()
        {
            string input = "user.test@example.com";
            bool result = Validator.IsEmailValid(input);
            Assert.True(result);

        }

    }
}
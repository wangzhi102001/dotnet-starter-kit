namespace FSH.Modules.Organization.Contracts;

public enum DataScope
{
    None = 0,
    AllDepartments = 1,
    CurrentAndChildren = 2,
    CurrentOnly = 3,
    Custom = 4,
    SelfOnly = 5
}

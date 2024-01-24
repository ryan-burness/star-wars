using BAL;
using BAL.Interface;
using DAL.Interface;
using DAL.StarWarsProvider;
using Polly;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
if (builder.Environment.IsDevelopment())
{
    //enable runtime compliation
    builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();
}
else
{
    builder.Services.AddControllersWithViews();
}


//Named client service for API 
builder.Services.AddHttpClient<StarWarsRepository>(httpClient =>
{
    httpClient.BaseAddress = new Uri(builder.Configuration["ApiUrl"] ?? "");
    httpClient.DefaultRequestHeaders.Add("api-key", builder.Configuration["ApiKey"]);
})
    //Using Polly for resilience 
    //Failed requests are retried up to three times.
    //Further external requests are blocked for 30 seconds if 5 failed attempts occur sequentially
    .AddTransientHttpErrorPolicy(policyBuilder =>  policyBuilder.RetryAsync(3))
    .AddTransientHttpErrorPolicy(policyBuilder =>  policyBuilder.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));

builder.Services.AddMemoryCache();
builder.Services.AddScoped<IStarWarsProvider, StarWarsRepository>();
builder.Services.AddScoped<ICharacterService, CharacterService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");



app.Run();

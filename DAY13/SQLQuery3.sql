create view orglocations
as 
select org.id,org.name,locc.id,loc.name from organizations org,location loc
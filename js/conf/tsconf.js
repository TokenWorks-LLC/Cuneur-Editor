var tsconf={
    "wikidata":
    {"label":"Wikidata","id":"wikidata","url":"https://www.wikidata.org/","endpoint":"https://query.wikidata.org/sparql",
    "queries":
        {
            "tabletsquery":`SELECT ?document ?documentLabel ?language ?languageLabel ?timeperiod ?timeperiodLabel (GROUP_CONCAT(DISTINCT ?image; SEPARATOR = " || ") AS ?images) WHERE {
  ?document wdt:P31 wd:Q66018222 .
  ?document rdfs:label ?documentLabel .
  #?fgproject rdfs:label ?fgprojectLabel .
  FILTER(lang(?documentLabel)="en")
  #FILTER(lang(?fgprojectLabel)="en")
  OPTIONAL {
    ?document wdt:P407 ?language .
    ?language rdfs:label ?languageLabel .
    FILTER(lang(?languageLabel)="en")
  }
  OPTIONAL {
    ?document wdt:P2348 ?timeperiod .
    ?timeperiod rdfs:label ?timeperiodLabel .
    FILTER(lang(?timeperiodLabel)="en")
  }
  OPTIONAL {
    ?document p:P18 ?imagee .
    ?imagee ps:P18 ?immage .
    OPTIONAL {
        ?imagee pq:P1029 ?surface .
		?surface rdfs:label ?surfaceLabel .
	    FILTER(lang(?surfaceLabel)="en")
    }
    BIND(CONCAT(STR(?immage),COALESCE(STR(?surfaceLabel),"")) AS ?image)
  }
}GROUP BY ?document ?documentLabel ?language ?languageLabel ?timeperiod ?timeperiodLabel 
ORDER BY ?documentLabel
`,
"tabletsdropdown":`SELECT ?document ?documentLabel WHERE {
?document wdt:P31 wd:Q66018222 .
  ?document rdfs:label ?documentLabel .
  FILTER(lang(?documentLabel)="en")
}
ORDER BY ?documentLabel
`,
"3dmodeldropdown":`SELECT ?document ?documentLabel ?3dmodel WHERE {
  BIND(%%docid%% AS ?document)
  ?document wdt:P31 wd:Q66018222 .
  ?document wdt:P4896 ?3dmodel .
  ?document rdfs:label ?documentLabel .
  FILTER(lang(?documentLabel)="en")
}
ORDER BY ?documentLabel
`,
"loadvariants":`SELECT ?document ?documentLabel (GROUP_CONCAT(DISTINCT ?image; SEPARATOR = " || ") AS ?images)  WHERE {
  BIND(%%docid%% AS ?document)
  ?document wdt:P31 wd:Q66018222 .
  ?document rdfs:label ?documentLabel .
  FILTER(lang(?documentLabel)="en")
  OPTIONAL {
    ?document p:P18 ?imagee .
    ?imagee ps:P18 ?immage .
    OPTIONAL {
        ?imagee pq:P1029 ?surface .
		?surface rdfs:label ?surfaceLabel .
	    FILTER(lang(?surfaceLabel)="en")
    }
    BIND(CONCAT(STR(?immage),COALESCE(STR(?surfaceLabel),"")) AS ?image)
  }
}GROUP BY ?document ?documentLabel
ORDER BY ?documentLabel
`}
},
"factgrid":
    {"label":"FactGrid","id":"factgrid","url":"https://database.factgrid.de/","endpoint":"https://database.factgrid.de/sparql",
        "queries":{
            "tabletsquery":`SELECT ?document ?documentLabel ?language ?languageLabel ?timeperiod ?timeperiodLabel (GROUP_CONCAT(DISTINCT ?image; SEPARATOR = " || ") AS ?images) ?transcript WHERE {
                ?document wdt:P401 ?material .
                {?document wdt:P2 wd:Q10671}UNION{
                  ?document wdt:P2/wdt:P2 wd:Q11208 .
                  }
                ?document rdfs:label ?documentLabel .
                #?fgproject rdfs:label ?fgprojectLabel .
                FILTER(lang(?documentLabel)="en")
                #FILTER(lang(?fgprojectLabel)="en")
                OPTIONAL {
                  ?document wdt:P18 ?language .
                  ?language rdfs:label ?languageLabel .
                  FILTER(lang(?languageLabel)="en")
                }
                OPTIONAL {
                  ?document wdt:P853 ?timeperiod .
                  ?timeperiod rdfs:label ?timeperiodLabel .
                  FILTER(lang(?timeperiodLabel)="en")
                }
                OPTIONAL {
                  ?document p:P188 ?imagee .
                  ?imagee ps:P188 ?immage .
                  OPTIONAL {
                      ?imagee pq:P1029 ?surface .
                      ?surface rdfs:label ?surfaceLabel .
                      FILTER(lang(?surfaceLabel)="en")
                  }
                  BIND(CONCAT(STR(?immage),"_",COALESCE(STR(?surfaceLabel),"")) AS ?image)
                }
                OPTIONAL {
                   ?document wdt:P251 ?transcript .
                }
              }GROUP BY ?document ?documentLabel ?language ?languageLabel ?timeperiod ?timeperiodLabel ?transcript
              ORDER BY ?documentLabel
              `,
            "tabletsdropdown":`
SELECT ?document ?documentLabel WHERE {
  ?document wdt:P401 ?material .
  {?document wdt:P2 wd:Q10671}UNION{
	?document wdt:P2/wdt:P2 wd:Q11208 .
    }
  ?document rdfs:label ?documentLabel .
  FILTER(lang(?documentLabel)="en")
}
ORDER BY ?documentLabel            
            `,
            "3dmodeldropdown":`
SELECT ?document ?documentLabel ?3dmodel WHERE {
  BIND(%%docid%% AS ?document)
  ?document wdt:P1034 ?3dmodel .
  ?document rdfs:label ?documentLabel .
  FILTER(lang(?documentLabel)="en")
}
ORDER BY ?documentLabel`,
            "loadvariants":`
SELECT ?document ?documentLabel (GROUP_CONCAT(DISTINCT ?image; SEPARATOR = " || ") AS ?images)  WHERE {
  BIND(%%docid%% AS ?document)
  ?document wdt:P401 ?material .
  {?document wdt:P2 wd:Q10671}UNION{
	?document wdt:P2/wdt:P2 wd:Q11208 .
    }
  ?document rdfs:label ?documentLabel .
  FILTER(lang(?documentLabel)="en")
  OPTIONAL {
    ?document p:P188 ?imagee .
    ?imagee ps:P188 ?immage .
    OPTIONAL {
        ?imagee pq:P1029 ?surface .
		?surface rdfs:label ?surfaceLabel .
	    FILTER(lang(?surfaceLabel)="en")
    }
    BIND(CONCAT(STR(?immage),"_",COALESCE(STR(?surfaceLabel),"")) AS ?image)
  }
}GROUP BY ?document ?documentLabel
ORDER BY ?documentLabel`

    }
}
}
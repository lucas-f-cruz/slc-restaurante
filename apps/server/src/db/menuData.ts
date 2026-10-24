export const MENU: any = {
  sol: [
    { title: "Petiscos", accent:"#C1502E", icon:"🍢", items: [
      {id:"p1", name:"Porção de Macaxeira Frita", price:15},
      {id:"p2", name:"Porção de Batata Frita", price:17},
      {id:"p3", name:"Batata Frita Especial", price:24, desc:"Com queijo cheddar e bacon crocante."},
      {id:"p4", name:"Iscas de Frango Crocante", price:37, desc:"Empanadas na farinha de milho, com batata ou macaxeira frita, salada e molho."},
      {id:"p5", name:"Iscas de Peixe Crocante", price:40, desc:"Empanadas na farinha panko, com batata ou macaxeira frita, salada e molho."},
      {id:"p6", name:"Combo Crocante", price:60, desc:"Iscas de frango e peixe com batata ou macaxeira frita, salada e molho."},
      {id:"p7", name:"Dadinho de Queijo", price:25, desc:"Queijo coalho empanado na farinha de rosca, com molho."},
      {id:"p8", name:"Escondidinho", price:25, desc:"Purê de macaxeira com carne de sol desfiada, queijo coalho e parmesão."},
      {id:"p9", name:"Filezinho de Carne", price:50, desc:"Com batata ou macaxeira frita, salada e molho."},
      {id:"p10", name:"Camarão Tradicional", price:50, desc:"No alho e óleo, com batata ou macaxeira frita, salada e molho."},
      {id:"p11", name:"Camarão Potiguara", price:70, desc:"Filés empanados na farinha panko, batata ou macaxeira frita, salada e molho."},
      {id:"p12", name:"Pastéis de Queijo", price:17, desc:"5 unidades, acompanha molho."},
      {id:"p13", name:"Pastéis de Carne de Sol", price:25, desc:"5 unidades, acompanha molho."},
      {id:"p14", name:"Pastéis de Frango", price:20, desc:"5 unidades, acompanha molho."},
      {id:"p15", name:"Pastéis de Camarão", price:25, desc:"5 unidades, acompanha molho."},
      {id:"p16", name:"Pastéis Nordestino", price:25, desc:"Carne de sol e queijo coalho, 5 unidades."}
    ]},
    { title: "Caldos", accent:"#8B3A2B", icon:"🥣", items: [
      {id:"c1", name:"Caldo Nordestino", price:19},
      {id:"c2", name:"Caldo de Camarão", price:14},
      {id:"c3", name:"Caldo de Rabada de Carneiro", price:14}
    ]},
    { title: "Porções", accent:"#B98A3D", icon:"🍚", items: [
      {id:"po1", name:"Feijão Verde", price:7},
      {id:"po2", name:"Feijoada", price:15},
      {id:"po3", name:"Arroz", price:6},
      {id:"po4", name:"Macarrão", price:6},
      {id:"po5", name:"Pratinho", price:5, desc:"Arroz, salada e farofa."}
    ]},
    { title: "Pratos Principais", note:"Servidos das 12h às 17h", accent:"#7A3B24", icon:"🍽️", items: [
      {id:"pp1", name:"Feijoada", price:20, desc:"Arroz, farofa e salada. Serve 1 pessoa."},
      {id:"pp2", name:"Frango a Passarinho", price:60, desc:"Arroz refogado, salada e batata frita. Serve 2 pessoas."},
      {id:"pp3", name:"Carne de Sol na Nata", price:80, desc:"Feijão farofado, arroz refogado e batata frita. Serve 2 pessoas."},
      {id:"pp4", name:"Macarrão Potiguara", price:80, desc:"Molho de tomate da casa, camarões empanados e queijo mussarela, com batata frita. Serve 2 pessoas."},
      {id:"pp5", name:"Moqueca de Peixe e Camarão", price:80, desc:"Arroz refogado, pirão e farofa de baiti. Serve 2 pessoas."},
      {id:"pp6", name:"Carne de Sol na Telha", price:109, desc:"Queijo coalho, batata ou macaxeira frita e salada, com feijão/feijoada, arroz, macarrão e molho. Serve 3 pessoas."},
      {id:"pp7", name:"Peixe na Telha", price:99, desc:"Tilápia frita no azeite de dendê, com batata ou macaxeira frita e salada. Serve 3 pessoas."},
      {id:"pp8", name:"Camarão na Telha", price:129, desc:"Filés empanados na farinha panko, com batata ou macaxeira frita e salada. Serve 3 pessoas."},
      {id:"pp9", name:"Galinha Caipira (Meia)", price:75, desc:"Feijão/feijoada, arroz, macarrão, pirão, macaxeira, salada e farofa. Serve 2 pessoas."},
      {id:"pp9b", name:"Galinha Caipira (Inteira)", price:150, desc:"Mesmo acompanhamento da meia. Serve 4 pessoas."},
      {id:"pp10", name:"Lasanha Nordestina", price:114, desc:"Carne de sol, queijo coalho, molho da casa, mussarela e parmesão, com arroz e batata frita."}
    ]},
    { title: "Tapiocas", note:"A partir das 18h", accent:"#D9A23B", icon:"🫓", items: [
      {id:"t1", name:"Rendada", price:10, desc:"Com queijo coalho."},
      {id:"t2", name:"Frango Cremoso", price:10},
      {id:"t3", name:"Carne de Sol na Nata", price:12},
      {id:"t4", name:"Sertaneja", price:15, desc:"Carne de sol na nata com queijo coalho."}
    ]},
    { title: "Sobremesas", accent:"#C46A82", icon:"🍮", items: [
      {id:"sb1", name:"Cocada na Quenga", price:12},
      {id:"sb2", name:"Lampião e Maria Bonita", price:14, desc:"Queijo coalho frito na manteiga da terra, com goiabada e mel de engenho."},
      {id:"sb3", name:"Afogatto", price:15, desc:"Sorvete com café, chocolate e chantily."},
      {id:"sb4", name:"Divino Chocolate", price:20, desc:"Brownie, sorvete, calda e chocolate."}
    ]}
  ],
  lua: [
    { title: "Cafés", accent:"#B8794A", icon:"☕", items: [
      {id:"cf1", name:"Café Puro", price:3},
      {id:"cf2", name:"Café com Canela", price:3},
      {id:"cf3", name:"Café com Leite", price:4},
      {id:"cf4", name:"Capuccino", price:10, desc:"Café com chocolate, chantily e canela."}
    ]},
    { title: "Diversos", accent:"#5C7CBF", icon:"🥤", items: [
      {id:"d1", name:"Água sem Gás", price:3},
      {id:"d2", name:"Água com Gás", price:4},
      {id:"d3", name:"Água de Coco Natural 400ml", price:6},
      {id:"d4", name:"Água de Coco Natural Litro", price:15},
      {id:"d5", name:"Água Tônica", price:6},
      {id:"d6", name:"Redbull Lata", price:12},
      {id:"d7", name:"Suco 300ml", price:6, desc:"Consulte sabores."},
      {id:"d8", name:"Suco Litro", price:18, desc:"Consulte sabores."},
      {id:"d9", name:"Refrigerante 350ml", price:6, desc:"Guaraná, Fanta Uva, Fanta Laranja, Coca-Cola, Coca-Cola Zero, Sprite, Schweppes Citrus."},
      {id:"d10", name:"Refrigerante Litro", price:10, desc:"Guaraná, Pepsi, Coca-Cola."}
    ]},
    { title: "Destilados & Vinhos", accent:"#A8763E", icon:"🥃", items: [
      {id:"ds1", name:"Pitu Lata", price:10},
      {id:"ds2", name:"Pitu Limão Lata", price:10},
      {id:"ds3", name:"Pitu Mel e Limão Lata", price:10},
      {id:"ds4", name:"Caranguejo Lata", price:10},
      {id:"ds5", name:"Caranguejo Ouro Lata", price:10},
      {id:"ds6", name:"Ypioca Lata", price:12},
      {id:"ds7", name:"Matuta", price:22},
      {id:"ds8", name:"Dreher Dose", price:5},
      {id:"ds9", name:"Black White Dose", price:8},
      {id:"ds10", name:"Old Par Dose", price:14},
      {id:"ds11", name:"Red Label", price:10},
      {id:"ds12", name:"Gin Rock's", price:8},
      {id:"ds13", name:"Vodka Smirnoff Dose", price:7},
      {id:"ds14", name:"Dreher Litro", price:45},
      {id:"ds15", name:"Black White 700ml", price:100},
      {id:"vn1", name:"Vinho Suave (Nacional)", price:40},
      {id:"vn2", name:"Vinho Seco (Internacional)", price:60, desc:"Consulte adega."}
    ]},
    { title: "Cervejas", accent:"#D9A233", icon:"🍺", items: [
      {id:"cv1", name:"Heineken Long Neck", price:10},
      {id:"cv2", name:"Heineken Long Neck Zero", price:10},
      {id:"cv3", name:"Budweiser Long Neck", price:10},
      {id:"cv4", name:"Stella Long Neck", price:10},
      {id:"cv5", name:"Skol Lata", price:5},
      {id:"cv6", name:"Devassa Lata", price:5},
      {id:"cv7", name:"Itaipava Lata", price:5},
      {id:"cv8", name:"Amstel 600ml", price:12},
      {id:"cv9", name:"Spaten 600ml", price:12},
      {id:"cv10", name:"Stella 600ml", price:14},
      {id:"cv11", name:"Heineken 600ml", price:16},
      {id:"cv12", name:"Skol Litro", price:12},
      {id:"cv13", name:"Itaipava Litro", price:12},
      {id:"cv14", name:"Devassa Litro", price:12},
      {id:"cv15", name:"Budweiser Litro", price:14}
    ]},
    { title: "Drinks Clássicos", accent:"#4FA9A0", icon:"🍸", items: [
      {id:"dk1", name:"Cabaré Ice", price:10},
      {id:"dk2", name:"Caipirinha Nevada", price:11, desc:"Cachaça, suco de limão."},
      {id:"dk3", name:"Caipiroska Nevada", price:12, desc:"Vodka, suco de limão."},
      {id:"dk4", name:"Caipigin Nevada", price:15, desc:"Gin, suco de limão."},
      {id:"dk5", name:"Mojito", price:18, desc:"Rum, suco de limão, xarope de açúcar, hortelã e água gaseificada."},
      {id:"dk6", name:"Gin Tônica", price:20, desc:"Gin, tônica, suco de limão, alecrim."},
      {id:"dk7", name:"Lagoa Azul", price:19, desc:"Vodka Smirnoff, curaçau blue, suco de limão, sprite."},
      {id:"dk8", name:"Piña Colada", price:20, desc:"Rum, suco de abacaxi, leite de coco natural, leite condensado."},
      {id:"dk9", name:"Negroni", price:22, desc:"Campari, gin, vermute rosso."}
    ]},
    { title: "Drinks sem Álcool", accent:"#6FA96F", icon:"🧃", items: [
      {id:"sa1", name:"Tropical Magali", price:15, desc:"Energético de melancia, xarope de açúcar, suco de limão, hortelã."},
      {id:"sa2", name:"Pôr do Sol", price:18, desc:"Energético de frutas vermelhas, água com gás, leite condensado."},
      {id:"sa3", name:"Piña Colada Zero", price:18, desc:"Suco de abacaxi, leite de coco natural, leite condensado, hortelã."}
    ]}
  ]
};

/*
 * Biblioteca para consistencia e calculo de Digitos de controle
 * de contas bancarias
 * 
 * Autor: Waldemar Guerrero
 * 
 */

function lZero(tZero, nLen) {

    tZero = "0".repeat(nLen) + tZero.trim();

    var nSize = tZero.length;

    tZero = tZero.substr(nSize - nLen, nLen)

    return tZero;

}


function CalcDc001(tCode) {
    /*
     * Autor    : Waldemar Guerrero
     * Descri��o: C�lculo do D�gito de controle (DC) da conta corrente ou Nr. ag�ncia 
     *            para o banco 001 Banco do Brasil. (Mesmo algoritmo para ambos)
     * Obs.     :
     *                 Fornecer como parametro:
     *                 
     *                 Agencia com 4 digitos :    AAAA
     *                 Conta com 6 d�gitos   :    CCCCCC 
     *                 
     *                 Sempre sem formata��o (pontos, tra�os, barras, etc).
     *                 
     */

    // Declara��es locais
    var nMlt = 2;
    var nSoma = 0;
    var nI = 0;
    var nDCalc = 0;

    for (nI = tCode.length - 1; nI >= 0; nI--) {     // For nI = 12 To 5 Step - 1

        nSoma += (parseInt(tCode.substr(nI, 1), 10)) * nMlt;
        nMlt++;

        if (nMlt > 9) {
            nMlt = 2;
        }

    }

    // C�lculo do d�gito da conta
    nDCalc = 11 - (nSoma % 11);
    if (nDCalc == 10) {
        tDCt = "0";               //  'tDCt = "X"
    }
    else if (nDCalc == 11) {
        tDCt = "0";
    }
    else {
        tDCt = String(nDCalc);
    }
    return tDCt;

}

function CalcDc033(tNrAgConta) {
    /*
     * Autor: Waldemar Guerrero
     * Descri��o: C�lculo do D�gito de controle (DC) da para o conjunto agencia + conta corrente
     *            para o banco 033 Santander
     * 
     * Onde tNrAgConta tem OBRIGATORIAMENTE o formato:
     * 
     *      AAAA00PPCCCCCC
     *    
     *      AAAA   - Quatro digitos para numero da ag�ncia
     *      00     - Digitos fixos
     *      PP     - C�digo da opera��o. 2 digitos. Pode assumir os valores
     *               "01/02/03/05/07/09/13/27/35/37/43/45/46/48/50/53/60/92"
     *               (Opera��o n�o consistida aqui.)
     *      CCCCCC - Numero da conta corrente em 6 posi��es, sem digito de controle
     *      
     */

    tNrAgConta = lZero(tNrAgConta, 14);    // Adiciona zeros a esquerda para prevenir erros de execu��o

    // Declara��es locais
    var aMlt = [9, 7, 3, 1, 0, 0, 9, 7, 1, 3, 1, 9, 7, 3];     // Multiplicador
    var nSoma = 0;
    var nI = 0;
    var nUn = 0;
    var nDCalc = 0;

    for (nI = 0; nI <= 13; nI++) {

        // Multiplica o d�gito e despreza a dezena
        nUn = parseInt(tNrAgConta.substr(nI, 1), 10) * aMlt[nI];

        // Despreza a dezena
        nUn -= (Math.trunc(nUn / 10) * 10);

        // Soma a unidade
        nSoma += nUn;

    }

    // Da soma, desprezar a dezena
    nSoma -= (Math.trunc(nSoma / 10) * 10);

    // Calculo do DC
    nDCalc = 10 - nSoma;

    if (nDCalc == 10) {
        nDCalc = 0;
    }

    return String(nDCalc);

}

function CalcDcAg041(tCode) {
    /*
     * Autor     : Waldemar Guerrero
     * Descri��o : C�lculo do digito de controle para agencia do 
     *             banco 041 Banrisul
     * 
     *    Formato
     *             AAAAnd   PPCCCCCCnd
     *             Agencia  Conta Corrente
     *             
     *                      AAAA numero da agencia
     *                      n    Primeiro DC calculado com base sobre a agencia ou conta.
     *                      d    Segundo DC calculado com base sobre a agencia ou conta + n.
     *                      
     *             Aten��o 
     *                      * O calculo do segundo DC tem uma regra bem particular.
     *                      * No cart�o do banco, o DC da agencia n�o vem impresso em relevo.
     *                         
     *        Exemplos do manual CNAB Cobran�a do Banrisul
     *        
     *        console.log(CalcDcAg041("9274"));    // Valor a retornar: 22
     *        console.log(CalcDcAg041("9194"));    // Valor a retornar: 38
     *
     */

    // Declara��es locais
    var nMlt = 2;
    var nSoma = 0;
    var nI = 0;
    var nUn = 0;    
    var nDV1 = 0;        // Primeiro digito de controle. Base 10
    var nDV2 = 11;       // Segundo d�gito de controle. Base 11; Iniciado com 11 para entrar no loop
    var tCodeExt = "";   // Armazena Agencia + 1. digito calculado.

    // C�lculo do primeiro d�gito verificador. Base10
    for (nI = tCode.length - 1; nI >= 0; nI--) {

        nUn = parseInt(tCode.substr(nI, 1), 10) * nMlt;
        if (nUn > 9) {
            nUn -= 9;
        }

        nSoma += nUn;
        nMlt = 2 / nMlt;      // Multiplicador se alterna entre os valores 2 e 1;

    }

    nDV1 = 10 - (nSoma % 10);
    if (nDV1 == 10) {
        nDV1 = 0
    }

    // Loop para c�lculo do segundo DC.
    // Incorpora nDV1 ao corpo e calcula nDV2
    nDV2 = 11;                                // For�a um valor para entrar no loop
    while (nDV2 > 9) {

        nSoma = 0;
        nMlt = 2;

        tCodeExt = tCode + String(nDV1);
        for (nI = tCodeExt.length - 1; nI >= 0; nI--) {

            nUn = parseInt(tCodeExt.substr(nI, 1), 10) * nMlt;
            nSoma += nUn;

            nMlt += 1;
            if (nMlt > 7) {
                nMlt = 2;
            }

        }

        // C�lculo do segundo d�gito
        nDV2 = 11 - (nSoma % 11);

        if (nDV2 > 9) {
            // Segundo digito n�o pode ser maior que 9. Incrementar nDC1 e persistir no loop
            nDV1 += 1;

            if (nDV1 > 9) {
                nDV1 = 0;
            }

        }

    }                  // loop de:  while (nDV2 > 9) {

    return String(nDV1) + String(nDV2);

}

function CalcDcCC041(tCode) {
    /*
     * Autor     : Waldemar Guerrero
     * Descri��o : Calculo do DC para a conta corrente do banco 041 Banrisul
     * 
     * Formato do par�metro esperado em tCode:
     * 
     *     TTCCCCCCCCD
     *     
     *     Onde
     *            TT         Tipo da conta corrente
     *            CCCCCCCC   Numero da conta corrente com 8 digitos
     *            D          Digito de controle (verificador) conforme abaixo;
     * 
     *     Formato completo do Nr. Conta Corrente Banrisul
     *             AAAAndPPCCCCCCnd
     *
     *                AAAA numero da agencia
     *                n    Primeiro DC calculado com base sobre a agencia ou conta.
     *                d    Segundo DC calculado com base sobre a agencia ou conta + n.
     *                
     *                PPCCCCCCnd : Descrito acima
     *
     */

    // Declara��es locais
    var aMlt = [3, 2, 4, 7, 6, 5, 4, 3, 2];
    var nSoma = 0;
    var nI = 0;
    var nUn = 0;
    var nDV = 0;

    // Loop de c�lculo do d�gito verificador.
    for (nI = tCode.length - 1; nI >= 0; nI--) {
        nSoma += parseInt(tCode.substr(nI, 1), 10) * aMlt[nI];
    }

    nDV = (nSoma % 11);

    if (nDV = 1) {
        nDV = 6;
    }
    else if (nDV != 0) {    // Para resto = 0, o DC ser� o proprio zero, sen�o 11 - 0 resultaria em DC = 11.
        nDV = 11 - nDV;
    }

    return String(nDV);

}

function CalcDc104(tNrAgConta) {
    /*
     * Autor     : Waldemar Guerrero
     * Descri��o : Calculo do digito de controle para conta corrente do
     *             banco 104 CEF - Caixa Economica Federal
     *
     *
     * Onde tNrAgConta obrigatoriamente o formato:
     *
     *      AAAAPPPCCCCCCCC
     *
     *      AAAA     - Quatro digitos para numero da ag�ncia
     *      PPP      - C�digo da opera��o. 3 d�gitos.
     *                 Pode assumir o valores 000|001|003|013|023, etc
     *      CCCCCCCC - Numero da conta corrente em 8 posi��es, sem digito de controle
     * 
     */

    tNrAgConta = lZero(tNrAgConta, 15);

    // Declara��es locais
    var nMlt = 2;
    var nSoma = 0;
    var nI = 0;
    var nDCalc = 0;

    for (nI = 14; nI >= 0; nI--) {     // For nI = 15 To 1 Step - 1

        nSoma += parseInt(tNrAgConta.substr(nI, 1), 10) * nMlt;

        nMlt = nMlt + 1;
        if (nMlt == 10) {
            nMlt = 2
        }
    }

    // Calculo do DC
    nSoma = nSoma * 10;
    nDCalc = nSoma % 11;

    if (nDCalc == 10) {
        nDCalc = 0;
    }

    return String(nDCalc);

}

function CalcDc237(tCode) {
    /*
     * Autor     : Waldemar Guerrero
     * Descri��o : Calculo de digito de controle para ag�ncia ou conta corrente
     *             para o banco 237 Bradesco.
     *             Ambos utilizam o mesmo algoritmo para DC da Agencia ou Conta Corrente.
     *             e s�o aplicados separadamente sobre agencia e CC, ao contrario da 
     *             maioria dos bancos que calcula o DC a partir da concatena��o Agencia + CC;
     * 
     * Aten��o:    O resultado DC = "P" foi substituido por DC = "0", seguindo
     *             o mesmo principio dos caixas eletronicos, onde se digita "0" no 
     *             lugar do d�gito "P" e tamb�m no interfaceamento inter banc�rio onde ocorre
     *             o mesmo principio.
     *             
     *             console.log(CalcDc237("40189"));
     * 
     * 
     */
    
    // Declara��es locais
    var nMlt = 2;
    var nSoma = 0;
    var nI = 0;
    var nDCalc = 0;
    var tDCt = "";

    // Apara tCode
    tCode = tCode.trim();

    for (nI = tCode.length - 1; nI >= 0; nI--) {

        nSoma += (parseInt(tCode.substr(nI, 1), 10) * nMlt);

        nMlt = nMlt + 1;
        if (nMlt > 7) {
            nMlt = 2;
        }
    }


    // Calcula o d�gito
    nDCalc = 11 - (nSoma % 11);
    if (nDCalc == 11) {
        tDCt = "0";
    }
    else if (nDCalc == 10) {
        tDCt = "0";               // 'tDCt = "P"
    }
    else {
        tDCt = String(nDCalc);
    }

    return tDCt;    // Bradesco Pronto

}

function CalcDc341(tCode) {
    /*
     * Autor      Waldemar Guerrero
     * Descri��o  Calculo do digito de controle sobre o conjunto Agencia + Conta Corrente
     *            para o banco 341 Ita�.
     * 
     * Formato    
     *            AAAACCCCC
     *            
     * Onde            
     *            AAAA     - Agencia com 4 digitos;
     *            CCCCC    - Conta Corrente com 5 digitos;
     *            
     */

    // Declara��es locais
    var nDgtM = 0;           // D�gito multiplicado
    var nMlt = 2;            // Multiplicador, Varia entre 1 e 2.
    var nSoma = 0;
    var nI = 0;

    tCode = tCode.trim();

    for (nI = tCode.length - 1; nI >= 0; nI--) {

        nDgtM = parseInt(tCode.substr(nI, 1), 10) * nMlt;

        if (nDgtM > 9) {
            // Soma o d�gito da dezena com o d�gito da unidade.
            // Exemplo: 15 --> 1 + 5 = 6
            nDgtM = Math.trunc(nDgtM / 10) + (nDgtM - (Math.trunc(nDgtM / 10) * 10));
            //     |====== Dezena =======| + |-------------- Unidade --------------|
        }

        nSoma += nDgtM;

        nMlt = 2 / nMlt;       // Alterna multiplicador entre os valores 1 e 2;

    }

    nDCalc = 10 - (nSoma % 10);
    if (nDCalc > 9) {
        nDCalc = 0;
    }

    return String(nDCalc);

}

function CalcDc356(tCode) {

    /*
     * Autor     Waldemar Guerrero
     * Descri��o C�lculo DC contas correntes Banco 356 Banco Real - Incorporado pelo Santander
     * 
     * 
     * Formato
     *         AAAACCCCCCC
     *         12341234567
     * Onde        
     *         AAAA     Agencia;
     *         CCCCCCC  Conta Corrente (7 digitos);
     *
     */

    // Declara��es locais
    var aMlt = [8, 1, 4, 7, 2, 2, 5, 9, 3, 9, 5]
    var nSoma = 0;
    var nLen = 0;
    var nI = 0;
    var nDCalc = 0;

    nLen = tCode.length - 1;

    for (nI = 0; nI <= nLen; nI++) {
        nSoma += parseInt(tCode.substr(nI, 1)) * aMlt[nI];
    }

    // Se o Resto for maior que 1 ent�o DV = 11 - Resto
    // Se o Resto for igual a 1 ent�o DIGITO = 0
    // Se o Resto for igual a 0 ent�o DIGITO = 1

    nDCalc = 11 - (nSoma % 11);

    if (nDCalc == 10) {
        nDCalc = 0
    } else if (nDCalc == 11) {
        nDCalc = 1;
    }

    return String(nDCalc);
}

function CalcDc399(tCode) {
    /*
     * Autor     Waldemar Guerrero
     * Descri��o C�lculo do DC sobre o conjunto Agencia + Conta Corrente
     *           para o banco banco 399 HSBC / Kirton Bank.
     * 
     * Formato:
     *     'AAAACCCCCC
     *     '1234123456-D
     *     
     *     Aten��o:
     *     
     *         Os cart�es HSBC foram impressos com DC de dois caracteres.
     *         incorporar o 1o. digito do DC ao numero da conta.
     *         
     *         Os cart�es de conta corrente do Kirton Bank s�o impressos com 
     *         o formato padr�o do mercado (DC com um digito somente).
     * 
     */

    // Declara��es locais
    var aMlt = [8, 9, 2, 3, 4, 5, 6, 7, 8, 9];     // "8923456789";
    var nSoma = 0;
    var nI = 0;
    var nLen = 0;
    var nDCalc = 0;

    nLen = tCode.length - 1;

    for (nI = 0; nI <= nLen; nI++) {

        nSoma += parseInt(tCode.substr(nI, 1), 10) * aMlt[nI];
    }

    // C�lculo do DC
    nDCalc = (nSoma % 11);

    if (nDCalc == 10) {
        nDCalc = 0
    }

    return String(nDCalc);

}

function CalcDc422(tCode) {
    /*
     * Autor      Waldemar Guerrero
     * Descri��o  Calculo do DC para o bloco agencia + conta corrente do banco 422 Safra. 
     *            Usa o mesmo algor�tmo do banco itau, mas aqui, considerar a conta com SEIS DIGITOS.
     *
     * Onde tNrAgConta tem o formato:
     *
     *      AAAACCCCCC
     *
     *      AAAA   - Quatro d�gitos para n�mero da ag�ncia
     *      CCCCCC - Numero da conta corrente em 6 posi��es, sem digito de controle
     *
     */

    // Declara��es Locais
    var nDgtM = 0;         // Digito multiplicado
    var nMlt = 2;          // Multiplicador, Varia entre 1 e 2.
    var nSoma = 0;
    var nI = 0;

    tCode = tCode.trim();
    for (nI = tCode.length - 1; nI >= 0; nI--) {

        nDgtM = parseInt(tCode.substr(nI, 1), 10) * nMlt;

        if (nDgtM > 9) {
            // Soma o d�gito da dezena com o d�gito da unidade.
            // Exemplo: 15 --> 1 + 5 = 6
            nDgtM = Math.trunc(nDgtM / 10) + (nDgtM - (Math.trunc(nDgtM / 10) * 10));
            //     |====== Dezena =======| + |------------- Unidade -------------|
        }

        nSoma += nDgtM;

        nMlt = 2 / nMlt;       // Alterna multiplicador entre os valores 1 e 2;

    }

    // Calculo do DC
    nDCalc = 10 - (nSoma % 10);
    if (nDCalc > 9) {
        nDCalc = 0;
    }

    return String(nDCalc);

}

function CalcDc745(tCode) {
    /*
     * Autor   :  Waldemar Guerrero
     * Decric�o:  C�lculo do d�gito de controle para o banco 745 Citibank
     * 
     * Formato
     *             CCCCCCC     - Conta corrente com 7 digitos;
     * 
     * Obserserva��o: O n�mero da agencia n�o participa do calculo do DC.
     *                Passar somente o nr. da conta como parametro.
     */

    // Declara��es locais
    var nSoma = 0;
    var nMlt = 2;
    var nI = 0;
    var nDCalc = 0;

    for (nI = tCode.length - 1; nI >= 0; nI--) {

        nSoma += parseInt(tCode.substr(nI, 1), 10) * nMlt;
        nMlt++;

        //if (nMlt > 7) {
        //    nMlt = 2;
        //}
    }

    // Se o Resto for maior que 1, o DC ser� (11 - Resto)
    // Sen�o o DV ser� 0 (Se Resto = 0 ou 1)

    nDCalc = 11 - (nSoma % 11);
    if (nDCalc > 9) {               // Resto = 1
        nDCalc = 0;
    }

    return String(nDCalc);

}

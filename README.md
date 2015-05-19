# CTC
Simulador de un Control de Tráfico Centralizado

Esta aplicación simula el tablero mímico de una central de Control de Tráfico Centralizado (CTC).

El sistema es capaz de manejar varios sectores a la vez.  Para ello dispone de un sistema de solapas
que permite seleccionar uno de varios sectores.  Inicialmente, no se ofrece ningún sector.  
Pulsando el icono `+` arriba a la izquierda se mostrará una lista de los sectores disponibles,
de donde se podrá seleccionar alguno de ellos.  
Al hacerlo, se creará una nueva solapa con el nombre de este sector.  Se puede cerrar cualquiera de
estas solapas con dar clic en el icono con una `x` a la derecha del nombre del sector en la solapa. 

A la derecha, una solapa llamada `Teletipo` permite visualizar alertas y avisos del sistema.  
Esta solapa es fija no puede cambiarse de posición o cerrarse.

El operador puede manipular ciertos elementos dentro de cada sector, por ejemplo, efectuar cambios.
Para ello, basta hacer click sobre la celda y las opciones disponibles en esa celda se mostrarán
en el panel a la derecha.  

----
La configuración de los diversos sectores está dada por archivos en formato JSON. 
Estos archivos se encuentran en la carpeta `data` de la aplicación.

* [Lista de sectores](#lista-de-sectores)
* [Descripción de un sector](#descripci%C3%B3n-de-un-sector)
	* [Encabezado](#encabezado)
	* [Celdas](#celdas)
		* [Línea](#linea)
		* [Cambio](#cambio)
		* [Paragolpe](#paragolpe)
		* [Cruce](#cruce)
		* [Triple](#triple)
	* [Señales](#se%C3%B1ales)
	* [Enclavamientos](#enclavamientos)
		* [Apareados](#apareados)
		* [Cambio a señal](#cambio-a-se%C3%B1al)
		* [Triple a señal](#triple-a-se%C3%B1al)

## Lista de sectores

El archivo `data/lista.json` contiene la lista de los sectores disponibles para controlar.

Por ejemplo:

	{
		"constitucion": {
			"nombre":"Constitución",
			"descr": "Estación Constitución, Ciudad de Buenos Aires, Argentina"
		},
		"retiro": {
			"nombre":"Retiro",
			"descr": "Mentira, apenas una línea"
		},
		"otra": {
			"nombre":"Otra",
			"descr": "En realidad no hay ninguna otra"
		}
	}

El archivo contiene un diccionario (hash-map) cuya clave es el nombre del 
archivo que contiene la definición de cada sector y como dato tiene un objeto con dos propiedades

* `nombre`: El nombre que aparecerá en la solapa y que se mostrará como enlace en el listado.
* `descr`: Descripción del sector.  Simplemente se muestra al usuario y no tiene ningún otro uso dentro de la aplicación.

Acorde al estándar del formato JSON, todos los nombres de propiedades han de estar entrecomillados.

Los valores de las claves de este diccionario se corresponden a los nombres de archivo 
a los cuales ha de agregársele la extensión `.json`.  Así pues, la entrada `"constitucion"` 
corresponde al archivo `data/constitucion.json`. Las claves del diccionario así como los nombres de los archivos deben
ser únicos dentro de la aplicación.  Ninguno de ellos se muestra al usuario y no se recomienda el uso de caracteres
que pudieran causar problemas de portabilidad entre sistemas operativos, tales como vocales acentuadas o incluso espacios en blanco.

## Descripción de un sector

Cada sector está descrito en un archivo en formato JSON.

El archivo contiene 3 partes principales

### Encabezado

El encabezado contiene información global sobre el sector, en particular:

* `descr`: El valor de esta propiedad se mostrará en la solapa que muestra este sector.
* `alto`: El número de celdas que ocupa este sector en altura.
* `ancho`: El número de celdas que ocupa este sector a lo ancho.

El valor de `descr` se mostrará en la solapa.  A diferencia del nombre de archivo, que el usuario no verá, este se mostrará en la solapa y debe ser legible.  Por ello, el archivo `constitucion.json` tiene como descripción en su encabezado: `"descr":"Constitución"`, con mayúscula y acento.

La imagen que representa el sector se ajustará para ocupar el máximo espacio posible dentro de la pantalla basándose en el `alto` y `ancho` declarados en el encabezado.

Ejemplo:

	{
		"descr": "Constitución",
		"ancho": 16,
		"alto": 7,
		...

### Celdas

Cada sector esta compuesto de varias celdas.  No es necesario declarar las celdas vacías, así pues el número de celdas en esta sección es habitualmente menor que el producto de `alto` * `ancho` del encabezado pues las celdas vacías no necesitan declararse.

Las configuración de las celdas está formada por la propiedad `celdas` que apunta a un diccionario (hash-map) cuya clave son las coordenadas X e Y de las celdas, como un *string* de números separados por comas.  Así, la definición de la celda en la posición X=3 e Y=5 estará bajo la clave `"3,5"`.  Cada entrada está compuesta por un objeto con varias propiedades, de las cuales la más importante es `tipo` que determina el contenido de la celda.  El resto de los parámetros de configuración dependen del tipo de celda.  Por ejemplo, el tipo más simple de celda es el que contiene una simple línea:

	"celdas": {
		...,
		"5,0": {
			"tipo": "linea",
			"descr": "XVI-b",
			"desde": {
				"dir":"N",
				"largo":200,
				"max":11.11
			},
			"hacia": {
				"dir":"S"
			}
		},
		...

Dentro de la lista de `celdas` la que se encuentra en la coordenada `5,0` (las coordenadas cuentan a partir de cero), contiene un tramo de vía simple que va de norte `N` a sur `S`.  La leyenda `XVI-b` se mostrará en una esquina de la celda.  Cada tramo de vía se define con al menos la propiedad `dir` (direción) que señala a alguno de los puntos cardinales.  Opcionalmente puede llevar indicación de longitud `largo` en metros y la velocidad máxima permitida en el tramo, en metros sobre segundo, en este caso 11.11 que equivalen a 40kph.  Las propiedades de `largo` y `max` son opcionales y si se omiten, se supone longitud cero y velocidad ilimitada.  En el caso de esta celda, entonces, el largo total de ambos segmentos es de 200 metros (200 + 0) y la velocidad 40kph.  En el segundo tramo, siendo la longitud cero, la velocidad máxima se hace irrelevante dado que, en cualquier caso, sería recorrido instantáneamente.

Todas las celdas son más o menos cuadradas.  Todos los segmentos de vías que contienen irradian del centro de ese cuadrado hacia una de 8 posibles direcciones, las cuatro esquinas y los puntos intermedios de los lados.  Estos extremos se los denomina por su coordenada geográfica.   Aún así, todas las líneas pasan por el centro del cuadrado.  Es obvio que una línea de norte a sur como la del ejemplo cruzará por el centro del cuadrado, pero también lo hará una que vaya de norte a este.  En lugar de hacer un simple trazo en diagonal uniendo estos lados, la celda se graficará con dos segmentos, uno desde el arriba (*norte*) hasta el centro y otro del centro a la derecha (*este*).

	NW  N  NE
	  \ | /
	W - . - E
	  / | \
	SW  S  SE

Los tipos de celdas son:

#### linea

Contiene una vía con una única entrada y una única salida, sin cambios o desvíos. Requiere las propiedades `desde` y `hacia` que señalarán a los puntos geográficos que une.  Los nombres `desde` y `hacia` son arbitrarios y no señalan el sentido del tráfico en la línea.

Ej.:

	"5,0": {
		"tipo": "linea",
		"desde": {"dir":"N"},
		"hacia": {"dir":"S"}
	}

#### Cambio

Contiene una vía con una entrada, la *punta* y una de dos salidas alternativas.  Requiere las propiedades `punta` que indica la dirección del tronco común del cambio, `normal` que indica la salida en línea con la `punta` e `invertido` que señala la salida alternativa.  

Ej: 

	"8,3": {
		"tipo": "cambio",
		"punta": {"dir":"SE"},
		"normal": {
			"dir":"NW",
			"max":11.11,
			"largo":10
		},
		"invertido": {
			"dir":"W",
			"max":3,
			"largo":10
		},
	}

En los cambios, tanto la longitud de los segmentos como la velocidad máxima en cada tramo cobra más importancia pues el tramo de vía que sale en curva suele tener un límite de velocidad menor que el que sale recto.

La propiedad Booleana `desviado` indica si el cambio está en la posición normal (`desviado: false`) o invertida (`desviado: true`).  Si no se especifica, se supone `false`.   Nótese que las palabras `true` o `false`, no deben ir entrecomilladas pues representan los valores Booleanos *verdadero*  o *falso*.  Si se entrecomillaran, representarían cadenas de caracteres con palabras que no significan nada.

La propiedad Booleana `"manual"` excluye al cambio de cualquier automatismo (ver [Enclavamientos](#Enclavamientos) más adelante) y sólo responderá a comandos manuales.

#### Paragolpe

Contiene un tramo de vía sin salida.  Requiere indicar la única salida mediante la propiedad `desde`.

Ej:

	"0,4": {
		"tipo": "paragolpe",
		"desde": {"dir":"E"}
	}
	
#### Cruce

Identifica un cruce de vías que no se conectan entre sí.  Pueden cruzarse a un mismo nivel o no.  Contiene las propiedades `l1` y `l2` identificando a las dos líneas que se cruzan.  Cada una de ellas lleva las propiedades `desde` y `hacia` como una celda de tipo `linea`. Opcionalmente pueden llevar la propiedad `nivel`.  Este valor es relativo, la línea con un nivel mayor cruza por encima de la de nivel menor.  Si los valores coinciden es que se cruzan a un mismo nivel.  Si falta el nivel se lo supone cero.

Ej:

	"3,4": {
		"tipo": "cruce",
		"l1": {
			"desde": {"dir":"SW"},
			"hacia": {"dir":"NE"},
			"nivel":1
		},
		"l2": {
			"desde": {"dir":"W"},
			"hacia": {"dir":"E"}
		}
	}
	
En este ejemplo, la linea `l1` cruza por encima de la `l2` dado que la primera tiene `nivel` en 1 y la otra no indica nivel, por lo que se lo supone cero.

#### Triple

Identifica un cambio de 3 salidas. Al igual que el cambio corriente, al extremo común se le llama `punta` y los otros serán `izq`, `centro` y `der`.  En realidad la denominación de `izq` y `der` es arbitraria y podrían estar cruzadas.

Ej:

	"2,4": {
		"tipo": "triple",
		"punta": {"dir":"W"},
		"centro": {"dir":"E"},
		"izq": {"dir":"NE"},
		"der": {"dir":"SE"}
	}

La configuración admite la propiedad opcional `"posicion"` con valores `-1`, `0` o `1` que indican la posición del cambio triple, *izquierda*, *centro* o *derecha* respectivamente.  Si no se indica, se supone `0` (*centro*).  Al igual que los Booleanos los valores numéricos no deben entrecomillarse, o sea, `"posicion": 0`.

La propiedad Booleana `"manual"` excluye al cambio de cualquier automatismo (ver [Enclavamientos](#Enclavamientos) más adelante) y sólo responderá a comandos manuales.

#### Señales

Las señales son parte de las celdas y se declaran dentro de cada celda individual.

Cada celda puede tener tantas señales como segmentos de vía, esto es 8. Ninguna celda tiene 8 segmentos, sólo las celdas de tipo `cruce` y `triple` tiene 4 segmentos, las demás no llegan a eso por lo que no tiene sentido que hubiera más señales que segmentos aunque nada impide poner una señal en medio del campo, donde nadie pueda verla.

Las señales siempre son *entrantes* esto es, son visibles a los trenes que circulan en sentido entrante a la celda o sea, se dirigen a su centro.  

Cada señal puede estar compuesta de hasta 3 luces, la `primaria` y dos secundarias `izq` y `der` por debajo de esta y ligeramente hacia un lado o al otro.  En el mímico, no se muestra un foco para cada color de los cuales sólo uno está encendido a un tiempo sino que se muestra un único círculo que cambia de color.  

Las señales se identifican por la orientación del segmento en que se encuentran. 

Ej.:

	"4,4": {
		"tipo": "cambio",
		"punta": "W",
		"normal": "E",
		"invertido": "SE",
		"senales": {
			"W": {
				"primaria": {
					"estado": "verde"
				},
				"der": {
					"estado": "alto"
				}
			}
		}
	}

En este ejemplo, en la celda `4,4` que contiene un cambio, habrá una señal en la punta que permite dar paso a cualquiera de los dos ramales.  La `punta` está hacia el lado izquierdo (`"W"`) al igual que lo está la única señal.  Esta está compuesta de dos luces, la `primaria` y la `der`, la primera en verde la otra en rojo.   

Podría agregarse otra luz en el segmento `invertido` (dirección `"SE"`) que regule el acceso de los trenes en el desvío a la vía principal:

	"4,4": {
		"tipo": "cambio",
		"punta": "W",
		"normal": "E",
		"invertido": "SE",
		"senales": {
			"W": {
				"primaria": {
					"estado": "verde"
				},
				"der": {
					"estado": "alto"
				}
			},
			"SE": {
				"primaria": {
					"estado":"alto"
				}
			}
		}
	}

Las señales se identifican mediante 3 valores, las dos primeras las coordenadas de la celda a la cual se le agrega la orientación.  En el ejemplo anterior tenemos las señales `"4,4,W"` y `"4,4,SE"`.  Dentro de la configuración de la celda, la primera parte (`"4,4"`) se omite por redundante.

El estado inicial de una señal está dado por el archivo de configuración, luego, este dependera de los enclavamientos definidos más adelante.  Cuando una señal depende de dos o más enclavamientos, siempre mostrará el estado más restrictivo.  Por ejemplo, una señal se podrá depender de que un cambio esté en la posición normal y que ciertos segmentos de vía estén libres.  en este aso, la señal sólo se pondrá en verde si ambos enclavamientos coinciden en que deba estar en verde.

### Enclavamientos

Llamamos enclavamientos a los automatismos que relacionan las acciones de los diversos elementos del tablero, por ejemplo, cambios que actúan en consonancia o que afectan señales.  

Todos los enclavamientos tienen en común la propiedad `tipo` que indica qué clase de automatismo utiliza.

#### Apareados

Dos o más celdas con vías de `"tipo":"cambio"` están apareadas cuando se mueven en consonancia, cuando una cambia a `normal` las otras cambian a ese mismo estado.  Este enclavamiento sólo requiere que se enumeren las coordenadas de las celdas que contienen los cambios a aparear:

	"enclavamientos": [
		{
			"tipo": "apareados",
			"celdas": ["4,4", "5,5"]
		},
		...
		
En este caso, los cambios que se encuentran en las celdas `4,4` y `5,5`operan en conjunto.  El número de celdas que se pueden aparear es ilimitado.

#### Cambio a señal

Define un enclavamiento por el cual una señal responde al estado de un cambio.  El cambio puede o no estar en la misma celda que la señal.

Ej.:

	{
		"tipo": "senalCambio",
		"senal": "8,3,SE",
		"celda": "8,3",
		"normal": {
			"primaria": "verde",
			"izq": "alto"
		},
		"desviado": {
			"primaria": "alto",
			"izq": "precaucion"
		}
	}
	
Esta entrada define un enclavamiento de tipo `senalCambio` donde la señal en `"8,3,SE"` depende del cambio en esa misma celda `"8,3"`.  Cuando el cambio está en `"normal"` la luz `primaria` de la señal deberá estar en `"verde"` y la luz secundaria `"izq"` en `"alto"`.  Cuando el cambio está en la posición `"desviado"` la luz primaria estará en rojo y la luz secundaria en amarillo.

#### Triple a señal

Similar al anterior pero en este caso es un cambio de tres ramas (de `"tipo":"triple"`) el que afecta a la señal.  Dado que el cambio tiene ahora más posiciones, también hay más combinaciones posibles de luces:

	{
		"tipo": "senalTriple",
		"senal": "2,4,W",
		"celda": "2,4",
		"izq": {
			"izq": "verde",
			"primaria": "alto",
			"der": "alto"
		},
		"centro": {
			"izq": "alto",
			"primaria": "verde",
			"der": "alto"
		},
		"der": {
			"izq": "alto",
			"primaria": "alto",
			"der": "verde"
		}
	}

En este caso la señal y el cambio triple se encuentran también en la misma celda `2,4`.   La configuración determina el estado de las luces tanto `primaria` como las dos secundarias (`izq` y `der`) en función de las tres posibles posiciones del cambio, `izq`, `centro` y `der`


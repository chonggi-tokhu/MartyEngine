function MartyEngine(game = new Chess(), martycolor = 'w', martylog = console.log) {
	var Marty = {};
	console.martylog = martylog;
	var EngineGame = function() {
		//http://www.bluefeversoft.com/Chess/
		var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		var PceChar = ".PNBRQKpnbrqk";
		var SideChar = "wb-";
		var RankChar = "12345678";
		var FileChar = "abcdefgh";
		var MFLAGEP = 0x40000;
		var MFLAGPS = 0x80000;
		var MFLAGCA = 0x1000000;
		var MFLAGCAP = 0x7c000;
		var MFLAGPROM = 0xf00000;
		var NOMOVE = 0;
		var CastlePerm = [
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 13, 15, 15, 15,
			12, 15, 15, 14, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 7, 15, 15, 15,
			3, 15, 15, 11, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15,
			15, 15, 15, 15, 15
		];
		var PIECES = {
			EMPTY: 0,
			wP: 1,
			wN: 2,
			wB: 3,
			wR: 4,
			wQ: 5,
			wK: 6,
			bP: 7,
			bN: 8,
			bB: 9,
			bR: 10,
			bQ: 11,
			bK: 12
		};
		var BRD_SQ_NUM = 120;
		var FILES = {
			FILE_A: 0,
			FILE_B: 1,
			FILE_C: 2,
			FILE_D: 3,
			FILE_E: 4,
			FILE_F: 5,
			FILE_G: 6,
			FILE_H: 7,
			FILE_NONE: 8
		};
		var RANKS = {
			RANK_1: 0,
			RANK_2: 1,
			RANK_3: 2,
			RANK_4: 3,
			RANK_5: 4,
			RANK_6: 5,
			RANK_7: 6,
			RANK_8: 7,
			RANK_NONE: 8
		};
		var CASTLEBIT = {
			WKCA: 1,
			WQCA: 2,
			BKCA: 4,
			BQCA: 8
		};
		var SQUARES = {
			A1: 21,
			B1: 22,
			C1: 23,
			D1: 24,
			E1: 25,
			F1: 26,
			G1: 27,
			H1: 28,
			A8: 91,
			B8: 92,
			C8: 93,
			D8: 94,
			E8: 95,
			F8: 96,
			G8: 97,
			H8: 98,
			NO_SQ: 99,
			OFFBOARD: 100
		};
		var MAXGAMEMOVES = 2048;
		var MAXPOSITIONMOVES = 256;
		var MAXDEPTH = 64;
		var INFINITE = 30000;
		var MATE = 29000;
		var PVENTRIES = 10000;
		var FilesBrd = new Array(BRD_SQ_NUM);
		var RanksBrd = new Array(BRD_SQ_NUM);
		var PieceVal = [0, 100, 325,
			325, 550, 1000,
			50000, 100, 325,
			325, 550, 1000,
			50000
		];
		var PieceCol = [2, 0, 0, 0,
			0, 0, 0, 1, 1, 1, 1,
			1, 1
		];
		var PiecePawn = [0, 1, 0, 0,
			0, 0, 0, 1, 0, 0, 0,
			0, 0
		];
		var PieceKnight = [0, 0, 1,
			0, 0, 0, 0, 0, 1, 0,
			0, 0, 0
		];
		var PieceKing = [0, 0, 0, 0,
			0, 0, 1, 0, 0, 0, 0,
			0, 1
		];
		var PieceRookQueen = [0, 0,
			0, 0, 1, 1, 0, 0, 0,
			0, 1, 1, 0
		];
		var PieceBishopQueen = [0,
			0, 0, 1, 0, 1, 0, 0,
			0, 1, 0, 1, 0
		];
		var PieceSlides = [0, 0, 0,
			1, 1, 1, 0, 0, 0, 1,
			1, 1, 0
		];
		var Kings = [PIECES.wK,
			PIECES.bK
		];
		var KnDir = [-8, -19, -21, -12, 8, 19, 21, 12];
		var RkDir = [-1, -10, 1,
			10
		];
		var BiDir = [-9, -11, 11,
			9
		];
		var KiDir = [-1, -10, 1, 10, -9, -11, 11, 9];
		var DirNum = [0, 0, 8, 4, 4,
			8, 8, 0, 8, 4, 4, 8,
			8
		];
		var PceDir = [0, 0, KnDir,
			BiDir, RkDir, KiDir,
			KiDir, 0, KnDir,
			BiDir, RkDir, KiDir,
			KiDir
		];
		var LoopNonSlidePce = [
			PIECES.wN, PIECES.wK, 0, PIECES.bN,
			PIECES.bK, 0
		];
		var LoopNonSlideIndex = [0,
			3
		];
		var LoopSlidePce = [PIECES.wB, PIECES.wR,
			PIECES.wQ, 0, PIECES.bB, PIECES.bR,
			PIECES.bQ, 0
		];
		var LoopSlideIndex = [0, 4];
		var PieceKeys = new Array(14 * 120);
		var SideKey;
		var CastleKeys = new Array(16);
		var Sq120ToSq64 = new Array(BRD_SQ_NUM);
		var Sq64ToSq120 = new Array(64);
		var Mirror64 = [
			56, 57, 58, 59, 60,
			61, 62, 63, 48, 49,
			50, 51, 52, 53, 54,
			55, 40, 41, 42,
			43, 44, 45, 46, 47,
			32, 33, 34, 35, 36,
			37, 38, 39, 24, 25,
			26, 27, 28, 29,
			30, 31, 16, 17, 18,
			19, 20, 21, 22, 23,
			8, 9, 10, 11, 12,
			13, 14, 15, 0, 1, 2,
			3, 4, 5, 6, 7,
		];

		function InitSq120To64() {
			var file = FILES.FILE_A;
			var rank = RANKS.RANK_1;
			var sq = SQUARES.A1;
			var sq64 = 0;
			for(index = 0; index < BRD_SQ_NUM; ++index) {
				Sq120ToSq64[index] = 65;
			}
			for(index = 0; index < 64; ++index) {
				Sq64ToSq120[index] = 120;
			}
			for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
				for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
					sq = fileRanktoSquare(file, rank);
					Sq64ToSq120[sq64] = sq;
					Sq120ToSq64[sq] = sq64;
					sq64++;
				}
			}
		}

		function getRand32() {
			return (
				(Math.floor(Math.random() * 255 + 1) << 23) | (Math.floor(Math.random() * 255 + 1) << 16) | (Math.floor(Math.random() * 255 + 1) << 8) | Math.floor(Math.random() * 255 + 1));
		}

		function fileRanktoSquare(f, r) {
			return 21 + f + r * 10;
		}

		function isSqOffBoard(sq) {
			return FilesBrd[sq] == SQUARES.OFFBOARD;
		}

		function hashPiece(pce, sq) {
			board.posKey ^= PieceKeys[pce * 120 + sq];
		}

		function hashCastle() {
			board.posKey ^= CastleKeys[board.castlePerm];
		}

		function hashSide() {
			board.posKey ^= SideKey;
		}

		function hashEnPas() {
			board.posKey ^= PieceKeys[board.enPas];
		}

		function sq120to64(sq120) {
			return Sq120ToSq64[sq120];
		}

		function sq64to120(sq64) {
			return Sq64ToSq120[sq64];
		}

		function getPieceIndex(pce, pceNum) {
			return pce * 10 + pceNum;
		}

		function mirror64(sq) {
			return Mirror64[sq];
		}
		/*
		0000 0000 0000 0000 0000 0111 1111 -> From 0x7F
		0000 0000 0000 0011 1111 1000 0000 -> To >> 7, 0x7F
		0000 0000 0011 1100 0000 0000 0000 -> Captured >> 14, 0xF
		0000 0000 0100 0000 0000 0000 0000 -> EP 0x40000
		0000 0000 1000 0000 0000 0000 0000 -> Pawn Start 0x80000
		0000 1111 0000 0000 0000 0000 0000 -> Promoted Piece >> 20, 0xF
		0001 0000 0000 0000 0000 0000 0000 -> Castle 0x1000000
		*/
		function fromSQ(m) {
			return m & 0x7f;
		}

		function toSQ(m) {
			return (m >> 7) & 0x7f;
		}

		function CAPTURED(m) {
			return (m >> 14) & 0xf;
		}

		function PROMOTED(m) {
			return (m >> 20) & 0xf;
		}

		function getPieceIndex(pce, pceNum) {
			return pce * 10 + pceNum;
		}
		let board = {};
		board.pieces = new Array(BRD_SQ_NUM);
		board.side = 0;
		board.fiftyMove = 0;
		board.hisPly = 0;
		board.history = [];
		board.ply = 0;
		board.enPas = 0;
		board.castlePerm = 0;
		board.material = new Array(2);
		board.pceNum = new Array(13);
		board.pList = new Array(14 * 10);
		board.posKey = 0;
		board.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
		board.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
		board.moveListStart = new Array(MAXDEPTH);
		board.PvArray = new Array(MAXDEPTH);
		board.PvTable = new Array(MAXDEPTH);
		board.searchHistory = new Array(14 * BRD_SQ_NUM);
		board.searchKillers = new Array(3 * MAXDEPTH);
		board.GameOver = false;

		function CreateFEN() {
			var fenStr = "";
			var rank, file, sq,
				piece;
			var emptyCount = 0;
			for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
				emptyCount = 0;
				for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
					sq = fileRanktoSquare(file, rank);
					piece = board.pieces[sq];
					if(piece == PIECES.EMPTY) {
						emptyCount++;
					}
					else {
						if(emptyCount != 0) {
							fenStr += emptyCount.toString();
						}
						emptyCount = 0;
						fenStr += PceChar[piece];
					}
				}
				if(emptyCount != 0) {
					fenStr += emptyCount.toString();
				}
				if(rank != RANKS.RANK_1) {
					fenStr += "/";
				}
				else {
					fenStr += " ";
				}
			}
			fenStr += SideChar[board.side] + " ";
			if(board.castlePerm == 0) {
				fenStr += "- ";
			}
			else {
				if(board.castlePerm & CASTLEBIT.WKCA) fenStr += "K";
				if(board.castlePerm & CASTLEBIT.WQCA) fenStr += "Q";
				if(board.castlePerm & CASTLEBIT.BKCA) fenStr += "k";
				if(board.castlePerm & CASTLEBIT.BQCA) fenStr += "q";
			}
			if(board.enPas == SQUARES.NO_SQ) {
				fenStr += " -";
			}
			fenStr += " ";
			fenStr += board.fiftyMove;
			fenStr += " ";
			var tempHalfMove = board.hisPly;
			if(board.side == 1) {
				tempHalfMove--;
			}
			fenStr += tempHalfMove / 2;
			return fenStr;
		}

		function ParseMove(from, to) {
			CreateMoves();
			var Move = NOMOVE;
			var PromPce = PIECES.EMPTY;
			var found = false;
			for(index = board.moveListStart[board.ply]; index < board.moveListStart[board.ply + 1];
				++index) {
				Move = board.moveList[index];
				if(fromSQ(Move) == from && toSQ(Move) == to) {
					PromPce = PROMOTED(Move);
					if(PromPce != PIECES.EMPTY) {
						if(
							(PromPce == PIECES.wQ && board.side == 0) || (PromPce == PIECES.bQ && board.side == 1)) {
							found = true;
							break;
						}
						continue;
					}
					found = true;
					break;
				}
			}
			if(found != false) {
				if(MakeMove(Move) == false) {
					return NOMOVE;
				}
				TakeMove();
				return Move;
			}
			return NOMOVE;
		}

		function CreatePosKey() {
			var sq = 0;
			var finalKey = 0;
			var piece = PIECES.EMPTY;
			for(sq = 0; sq < BRD_SQ_NUM; ++sq) {
				piece = board.pieces[sq];
				if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
					finalKey ^= PieceKeys[piece * 120 + sq];
				}
			}
			if(board.side == 0) {
				finalKey ^= SideKey;
			}
			if(board.enPas != SQUARES.NO_SQ) {
				finalKey ^= PieceKeys[board.enPas];
			}
			finalKey ^= CastleKeys[board.castlePerm];
			return finalKey;
		}

		function OppositePrSq(move) {
			// takes in a move and returns the reverse of prsq
			// b1 > 22
			// c3 > 43
			// e2 > 35
			// e3 > 45
			var file = {
				a: 1,
				b: 2,
				c: 3,
				d: 4,
				e: 5,
				f: 6,
				g: 7,
				h: 8,
			};
			let to120 = file[move[0]] + 10 * (parseInt(move[1]) + 1);
			return to120;
		}

		function UpdateListsMaterial() {
			var piece, sq, index,
				colour;
			for(index = 0; index < 14 * 120; ++index) {
				board.pList[index] = PIECES.EMPTY;
			}
			for(index = 0; index < 2; ++index) {
				board.material[index] = 0;
			}
			for(index = 0; index < 13; ++index) {
				board.pceNum[index] = 0;
			}
			for(index = 0; index < 64; ++index) {
				sq = sq64to120(index);
				piece = board.pieces[sq];
				if(piece != PIECES.EMPTY) {
					colour = PieceCol[piece];
					board.material[colour] += PieceVal[piece];
					board.pList[getPieceIndex(piece, board.pceNum[piece])] = sq;
					board.pceNum[piece]++;
				}
			}
		}

		function ResetBoard() {
			var index = 0;
			for(index = 0; index < BRD_SQ_NUM; ++index) {
				board.pieces[index] = SQUARES.OFFBOARD;
			}
			for(index = 0; index < 64; ++index) {
				board.pieces[sq64to120(index)] = PIECES.EMPTY;
			}
			board.side = 2;
			board.enPas = SQUARES.NO_SQ;
			board.fiftyMove = 0;
			board.ply = 0;
			board.hisPly = 0;
			board.castlePerm = 0;
			board.posKey = 0;
			board.moveListStart[board.ply] = 0;
			board.GameOver = false;
		}
		//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
		function ParseFen(fen) {
			ResetBoard();
			var rank = RANKS.RANK_8;
			var file = FILES.FILE_A;
			var piece = 0;
			var count = 0;
			var i = 0;
			var sq120 = 0;
			var fenCnt = 0; // fen[fenCnt]
			// prettier-ignore
			while((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
				count = 1;
				switch(fen[fenCnt]) {
					case 'p':
						piece = PIECES.bP;
						break;
					case 'r':
						piece = PIECES.bR;
						break;
					case 'n':
						piece = PIECES.bN;
						break;
					case 'b':
						piece = PIECES.bB;
						break;
					case 'k':
						piece = PIECES.bK;
						break;
					case 'q':
						piece = PIECES.bQ;
						break;
					case 'P':
						piece = PIECES.wP;
						break;
					case 'R':
						piece = PIECES.wR;
						break;
					case 'N':
						piece = PIECES.wN;
						break;
					case 'B':
						piece = PIECES.wB;
						break;
					case 'K':
						piece = PIECES.wK;
						break;
					case 'Q':
						piece = PIECES.wQ;
						break;
					case '1':
					case '2':
					case '3':
					case '4':
					case '5':
					case '6':
					case '7':
					case '8':
						piece = PIECES.EMPTY;
						count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
						break;
					case '/':
					case ' ':
						rank--;
						file = FILES.FILE_A;
						fenCnt++;
						continue;
					default:
						console.martylog("FEN error");
						return;
				}
				for(i = 0; i < count; i++) {
					sq120 = fileRanktoSquare(file, rank);
					board.pieces[sq120] = piece;
					file++;
				}
				fenCnt++;
			} // while loop end
			//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
			board.side = fen[fenCnt] == "w" ? 0 : 1;
			fenCnt += 2;
			for(i = 0; i < 4; i++) {
				if(fen[fenCnt] == " ") {
					break;
				}
				switch(fen[fenCnt]) {
					case "K":
						board.castlePerm |= CASTLEBIT.WKCA;
						break;
					case "Q":
						board.castlePerm |= CASTLEBIT.WQCA;
						break;
					case "k":
						board.castlePerm |= CASTLEBIT.BKCA;
						break;
					case "q":
						board.castlePerm |= CASTLEBIT.BQCA;
						break;
					default:
						break;
				}
				fenCnt++;
			}
			fenCnt++;
			if(fen[fenCnt] != "-") {
				file = fen[fenCnt].charCodeAt() - "a".charCodeAt();
				rank = fen[fenCnt + 1].charCodeAt() - "1".charCodeAt();
				console.martylog("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
				board.enPas = fileRanktoSquare(file, rank);
			}
			board.posKey = CreatePosKey();
			UpdateListsMaterial();
		}

		function SqAttacked(sq, side) {
			var pce;
			var t_sq;
			var index;
			if(side == 0) {
				if(board.pieces[sq - 11] == PIECES.wP || board.pieces[sq - 9] == PIECES.wP) {
					return true;
				}
			}
			else {
				if(board.pieces[sq + 11] == PIECES.bP || board.pieces[sq + 9] == PIECES.bP) {
					return true;
				}
			}
			for(index = 0; index < 8; index++) {
				pce = board.pieces[sq + KnDir[index]];
				if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKnight[pce] == true) {
					return true;
				}
			}
			for(index = 0; index < 4; ++index) {
				dir = RkDir[index];
				t_sq = sq + dir;
				pce = board.pieces[t_sq];
				while(pce != SQUARES.OFFBOARD) {
					if(pce != PIECES.EMPTY) {
						if(PieceRookQueen[pce] == true && PieceCol[pce] == side) {
							return true;
						}
						break;
					}
					t_sq += dir;
					pce = board.pieces[t_sq];
				}
			}
			for(index = 0; index < 4; ++index) {
				dir = BiDir[index];
				t_sq = sq + dir;
				pce = board.pieces[t_sq];
				while(pce != SQUARES.OFFBOARD) {
					if(pce != PIECES.EMPTY) {
						if(PieceBishopQueen[pce] == true && PieceCol[pce] == side) {
							return true;
						}
						break;
					}
					t_sq += dir;
					pce = board.pieces[t_sq];
				}
			}
			for(index = 0; index < 8; index++) {
				pce = board.pieces[sq + KiDir[index]];
				if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKing[pce] == true) {
					return true;
				}
			}
			return false;
		}
		/****************************\
		 ============================
		
		Make Move
		============================              
		\****************************/
		function ClearPiece(sq) {
			var pce = board.pieces[sq];
			var col = PieceCol[pce];
			var index;
			var t_pceNum = -1;
			hashPiece(pce, sq);
			board.pieces[sq] = PIECES.EMPTY;
			board.material[col] -= PieceVal[pce];
			for(index = 0; index < board.pceNum[pce]; ++index) {
				if(board.pList[getPieceIndex(pce, index)] == sq) {
					t_pceNum = index;
					break;
				}
			}
			board.pceNum[pce]--;
			board.pList[getPieceIndex(pce, t_pceNum)] = board.pList[getPieceIndex(pce, board.pceNum[pce])];
		}

		function AddPiece(sq, pce) {
			var col = PieceCol[pce];
			hashPiece(pce, sq);
			board.pieces[sq] = pce;
			board.material[col] += PieceVal[pce];
			board.pList[getPieceIndex(pce, board.pceNum[pce])] = sq;
			board.pceNum[pce]++;
		}

		function MovePiece(from, to) {
			var index = 0;
			var pce = board.pieces[from];
			hashPiece(pce, from);
			board.pieces[from] = PIECES.EMPTY;
			hashPiece(pce, to);
			board.pieces[to] = pce;
			for(index = 0; index < board.pceNum[pce]; ++index) {
				if(board.pList[getPieceIndex(pce, index)] == from) {
					board.pList[getPieceIndex(pce, index)] = to;
					break;
				}
			}
		}

		function MakeMove(move) {
			var from = fromSQ(move);
			var to = toSQ(move);
			var side = board.side;
			board.history[board.hisPly].posKey = board.posKey;
			if((move & MFLAGEP) != 0) {
				if(side == 0) {
					ClearPiece(to - 10);
				}
				else {
					ClearPiece(to + 10);
				}
			}
			else if((move & MFLAGCA) != 0) {
				switch(to) {
					case SQUARES.C1:
						MovePiece(SQUARES.A1, SQUARES.D1);
						break;
					case SQUARES.C8:
						MovePiece(SQUARES.A8, SQUARES.D8);
						break;
					case SQUARES.G1:
						MovePiece(SQUARES.H1, SQUARES.F1);
						break;
					case SQUARES.G8:
						MovePiece(SQUARES.H8, SQUARES.F8);
						break;
					default:
						break;
				}
			}
			if(board.enPas != SQUARES.NO_SQ) hashEnPas();
			hashCastle();
			board.history[board.hisPly].move = move;
			board.history[board.hisPly].fiftyMove = board.fiftyMove;
			board.history[board.hisPly].enPas = board.enPas;
			board.history[board.hisPly].castlePerm = board.castlePerm;
			board.castlePerm &= CastlePerm[from];
			board.castlePerm &= CastlePerm[to];
			board.enPas = SQUARES.NO_SQ;
			hashCastle();
			var captured = CAPTURED(move);
			board.fiftyMove++;
			if(captured != PIECES.EMPTY) {
				ClearPiece(to);
				board.fiftyMove = 0;
			}
			board.hisPly++;
			board.ply++;
			if(PiecePawn[board.pieces[from]] == true) {
				board.fiftyMove = 0;
				if((move & MFLAGPS) != 0) {
					if(side == 0) {
						board.enPas = from + 10;
					}
					else {
						board.enPas = from - 10;
					}
					hashEnPas();
				}
			}
			MovePiece(from, to);
			var prPce = PROMOTED(move);
			if(prPce != PIECES.EMPTY) {
				ClearPiece(to);
				AddPiece(to, prPce);
			}
			board.side ^= 1;
			hashSide();
			if(SqAttacked(board.pList[getPieceIndex(Kings[side], 0)], board.side)) {
				TakeMove();
				return false;
			}
			return true;
		}

		function TakeMove() {
			board.hisPly--;
			board.ply--;
			var move = board.history[board.hisPly].move;
			var from = fromSQ(move);
			var to = toSQ(move);
			if(board.enPas != SQUARES.NO_SQ) hashEnPas();
			hashCastle();
			board.castlePerm = board.history[board.hisPly].castlePerm;
			board.fiftyMove = board.history[board.hisPly].fiftyMove;
			board.enPas = board.history[board.hisPly].enPas;
			if(board.enPas != SQUARES.NO_SQ) hashEnPas();
			hashCastle();
			board.side ^= 1;
			hashSide();
			if((MFLAGEP & move) != 0) {
				if(board.side == 0) {
					AddPiece(to - 10, PIECES.bP);
				}
				else {
					AddPiece(to + 10, PIECES.wP);
				}
			}
			else if((MFLAGCA & move) != 0) {
				switch(to) {
					case SQUARES.C1:
						MovePiece(SQUARES.D1, SQUARES.A1);
						break;
					case SQUARES.C8:
						MovePiece(SQUARES.D8, SQUARES.A8);
						break;
					case SQUARES.G1:
						MovePiece(SQUARES.F1, SQUARES.H1);
						break;
					case SQUARES.G8:
						MovePiece(SQUARES.F8, SQUARES.H8);
						break;
					default:
						break;
				}
			}
			MovePiece(to, from);
			var captured = CAPTURED(move);
			if(captured != PIECES.EMPTY) {
				AddPiece(to, captured);
			}
			if(PROMOTED(move) != PIECES.EMPTY) {
				ClearPiece(from);
				AddPiece(from, PieceCol[PROMOTED(move)] == 0 ? PIECES.wP : PIECES.bP);
			}
		}

		function ThreeFoldRep() {
			var i = 0,
				r = 0;
			for(i = 0; i < board.hisPly; ++i) {
				if(board.history[i].posKey == board.posKey) {
					r++;
				}
			}
			return r;
		}

		function DrawMaterial() {
			if(board.pceNum[PIECES.wP] != 0 || board.pceNum[PIECES.bP] != 0) return false;
			if(board.pceNum[PIECES.wQ] != 0 || board.pceNum[PIECES.bQ] != 0 || board.pceNum[PIECES.wR] != 0 || board.pceNum[PIECES.bR] != 0) return false;
			if(board.pceNum[PIECES.wB] > 1 || board.pceNum[PIECES.bB] > 1) {
				return false;
			}
			if(board.pceNum[PIECES.wN] > 1 || board.pceNum[PIECES.bN] > 1) {
				return false;
			}
			if(board.pceNum[PIECES.wN] != 0 && board.pceNum[PIECES.wB] != 0) {
				return false;
			}
			if(board.pceNum[PIECES.bN] != 0 && board.pceNum[PIECES.bB] != 0) {
				return false;
			}
			return true;
		}
		/****************************\
		 ============================
		
		Move Gen
		============================              
		\****************************/
		var MvvLvaValue = [
			0, 100, 200, 300,
			400, 500, 600, 100,
			200, 300, 400, 500,
			600,
		];
		var MvvLvaScores = new Array(14 * 14);

		function MoveExists(move) {
			CreateMoves();
			var index;
			var moveFound = NOMOVE;
			for(index = board.moveListStart[board.ply]; index < board.moveListStart[board.ply + 1];
				++index) {
				moveFound = board.moveList[index];
				if(MakeMove(moveFound) == false) {
					continue;
				}
				TakeMove();
				if(move == moveFound) {
					return true;
				}
			}
			return false;
		}

		function MOVE(from, to, captured, promoted, flag) {
			return from | (to << 7) | (captured << 14) | (promoted << 20) | flag;
		}

		function AddCaptureMove(move) {
			board.moveList[board.moveListStart[board.ply + 1]] = move;
			board.moveScores[board.moveListStart[board.ply + 1]++] = MvvLvaScores[CAPTURED(move) * 14 + board.pieces[fromSQ(move)]] + 1000000;
		}

		function AddQuietMove(move) {
			board.moveList[board.moveListStart[board.ply + 1]] = move;
			board.moveScores[board.moveListStart[board.ply + 1]] = 0;
			if(move == board.searchKillers[board.ply]) {
				board.moveScores[board.moveListStart[board.ply + 1]] = 900000;
			}
			else if(move == board.searchKillers[board.ply + MAXDEPTH]) {
				board.moveScores[board.moveListStart[board.ply + 1]] = 800000;
			}
			else {
				board.moveScores[board.moveListStart[board.ply + 1]] = board.searchHistory[board.pieces[fromSQ(move)] * BRD_SQ_NUM + toSQ(move)];
			}
			board.moveListStart[board.ply + 1]++;
		}

		function AddEnPassantMove(move) {
			board.moveList[board.moveListStart[board.ply + 1]] = move;
			board.moveScores[board.moveListStart[board.ply + 1]++] = 105 + 1000000;
		}

		function AddWhitePawnCaptureMove(from, to, cap) {
			if(RanksBrd[from] == RANKS.RANK_7) {
				AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
				AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
				AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
				AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
			}
			else {
				AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
			}
		}

		function AddBlackPawnCaptureMove(from, to, cap) {
			if(RanksBrd[from] == RANKS.RANK_2) {
				AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
				AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
				AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
				AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
			}
			else {
				AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
			}
		}

		function AddWhitePawnQuietMove(from, to) {
			if(RanksBrd[from] == RANKS.RANK_7) {
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
			}
			else {
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
			}
		}

		function AddBlackPawnQuietMove(from, to) {
			if(RanksBrd[from] == RANKS.RANK_2) {
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
			}
			else {
				AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
			}
		}

		function CreateMoves() {
			board.moveListStart[board.ply + 1] = board.moveListStart[board.ply];
			var pceType;
			var pceNum;
			var sq;
			var pceIndex;
			var pce;
			var t_sq;
			var dir;
			if(board.side == 0) {
				pceType = PIECES.wP;
				for(pceNum = 0; pceNum < board.pceNum[pceType]; ++pceNum) {
					sq = board.pList[getPieceIndex(pceType, pceNum)];
					if(board.pieces[sq + 10] == PIECES.EMPTY) {
						AddWhitePawnQuietMove(sq, sq + 10);
						if(RanksBrd[sq] == RANKS.RANK_2 && board.pieces[sq + 20] == PIECES.EMPTY) {
							AddQuietMove(MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
						}
					}
					if(isSqOffBoard(sq + 9) == false && PieceCol[board.pieces[sq + 9]] == 1) {
						AddWhitePawnCaptureMove(sq, sq + 9, board.pieces[sq + 9]);
					}
					if(isSqOffBoard(sq + 11) == false && PieceCol[board.pieces[sq + 11]] == 1) {
						AddWhitePawnCaptureMove(sq, sq + 11, board.pieces[sq + 11]);
					}
					if(board.enPas != SQUARES.NO_SQ) {
						if(sq + 9 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
						if(sq + 11 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
					}
				}
				if(board.castlePerm & CASTLEBIT.WKCA) {
					if(board.pieces[SQUARES.F1] == PIECES.EMPTY && board.pieces[SQUARES.G1] == PIECES.EMPTY) {
						if(SqAttacked(SQUARES.F1, 1) == false && SqAttacked(SQUARES.E1, 1) == false) {
							AddQuietMove(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
						}
					}
				}
				if(board.castlePerm & CASTLEBIT.WQCA) {
					if(board.pieces[SQUARES.D1] == PIECES.EMPTY && board.pieces[SQUARES.C1] == PIECES.EMPTY && board.pieces[SQUARES.B1] == PIECES.EMPTY) {
						if(SqAttacked(SQUARES.D1, 1) == false && SqAttacked(SQUARES.E1, 1) == false) {
							AddQuietMove(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
						}
					}
				}
			}
			else {
				pceType = PIECES.bP;
				for(pceNum = 0; pceNum < board.pceNum[pceType]; ++pceNum) {
					sq = board.pList[getPieceIndex(pceType, pceNum)];
					if(board.pieces[sq - 10] == PIECES.EMPTY) {
						AddBlackPawnQuietMove(sq, sq - 10);
						if(RanksBrd[sq] == RANKS.RANK_7 && board.pieces[sq - 20] == PIECES.EMPTY) {
							AddQuietMove(MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFLAGPS));
						}
					}
					if(isSqOffBoard(sq - 9) == false && PieceCol[board.pieces[sq - 9]] == 0) {
						AddBlackPawnCaptureMove(sq, sq - 9, board.pieces[sq - 9]);
					}
					if(isSqOffBoard(sq - 11) == false && PieceCol[board.pieces[sq - 11]] == 0) {
						AddBlackPawnCaptureMove(sq, sq - 11, board.pieces[sq - 11]);
					}
					if(board.enPas != SQUARES.NO_SQ) {
						if(sq - 9 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
						if(sq - 11 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
					}
				}
				if(board.castlePerm & CASTLEBIT.BKCA) {
					if(board.pieces[SQUARES.F8] == PIECES.EMPTY && board.pieces[SQUARES.G8] == PIECES.EMPTY) {
						if(SqAttacked(SQUARES.F8, 0) == false && SqAttacked(SQUARES.E8, 0) == false) {
							AddQuietMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
						}
					}
				}
				if(board.castlePerm & CASTLEBIT.BQCA) {
					if(board.pieces[SQUARES.D8] == PIECES.EMPTY && board.pieces[SQUARES.C8] == PIECES.EMPTY && board.pieces[SQUARES.B8] == PIECES.EMPTY) {
						if(SqAttacked(SQUARES.D8, 0) == false && SqAttacked(SQUARES.E8, 0) == false) {
							AddQuietMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA));
						}
					}
				}
			}
			pceIndex = LoopNonSlideIndex[board.side];
			pce = LoopNonSlidePce[pceIndex++];
			while(pce != 0) {
				for(pceNum = 0; pceNum < board.pceNum[pce]; ++pceNum) {
					sq = board.pList[getPieceIndex(pce, pceNum)];
					for(index = 0; index < DirNum[pce]; index++) {
						dir = PceDir[pce]
							[index];
						t_sq = sq + dir;
						if(isSqOffBoard(t_sq) == true) {
							continue;
						}
						if(board.pieces[t_sq] != PIECES.EMPTY) {
							if(PieceCol[board.pieces[t_sq]] != board.side) {
								AddCaptureMove(MOVE(sq, t_sq, board.pieces[t_sq], PIECES.EMPTY, 0));
							}
						}
						else {
							AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
						}
					}
				}
				pce = LoopNonSlidePce[pceIndex++];
			}
			pceIndex = LoopSlideIndex[board.side];
			pce = LoopSlidePce[pceIndex++];
			while(pce != 0) {
				for(pceNum = 0; pceNum < board.pceNum[pce]; ++pceNum) {
					sq = board.pList[getPieceIndex(pce, pceNum)];
					for(index = 0; index < DirNum[pce]; index++) {
						dir = PceDir[pce]
							[index];
						t_sq = sq + dir;
						while(isSqOffBoard(t_sq) == false) {
							if(board.pieces[t_sq] != PIECES.EMPTY) {
								if(PieceCol[board.pieces[t_sq]] != board.side) {
									AddCaptureMove(MOVE(sq, t_sq, board.pieces[t_sq], PIECES.EMPTY, 0));
								}
								break;
							}
							AddQuietMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
							t_sq += dir;
						}
					}
				}
				pce = LoopSlidePce[pceIndex++];
			}
		}

		function CreateCaptures() {
			board.moveListStart[board.ply + 1] = board.moveListStart[board.ply];
			var pceType;
			var pceNum;
			var sq;
			var pceIndex;
			var pce;
			var t_sq;
			var dir;
			if(board.side == 0) {
				pceType = PIECES.wP;
				for(pceNum = 0; pceNum < board.pceNum[pceType]; ++pceNum) {
					sq = board.pList[getPieceIndex(pceType, pceNum)];
					if(isSqOffBoard(sq + 9) == false && PieceCol[board.pieces[sq + 9]] == 1) {
						AddWhitePawnCaptureMove(sq, sq + 9, board.pieces[sq + 9]);
					}
					if(isSqOffBoard(sq + 11) == false && PieceCol[board.pieces[sq + 11]] == 1) {
						AddWhitePawnCaptureMove(sq, sq + 11, board.pieces[sq + 11]);
					}
					if(board.enPas != SQUARES.NO_SQ) {
						if(sq + 9 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
						if(sq + 11 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
					}
				}
			}
			else {
				pceType = PIECES.bP;
				for(pceNum = 0; pceNum < board.pceNum[pceType]; ++pceNum) {
					sq = board.pList[getPieceIndex(pceType, pceNum)];
					if(isSqOffBoard(sq - 9) == false && PieceCol[board.pieces[sq - 9]] == 0) {
						AddBlackPawnCaptureMove(sq, sq - 9, board.pieces[sq - 9]);
					}
					if(isSqOffBoard(sq - 11) == false && PieceCol[board.pieces[sq - 11]] == 0) {
						AddBlackPawnCaptureMove(sq, sq - 11, board.pieces[sq - 11]);
					}
					if(board.enPas != SQUARES.NO_SQ) {
						if(sq - 9 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
						if(sq - 11 == board.enPas) {
							AddEnPassantMove(MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP));
						}
					}
				}
			}
			pceIndex = LoopNonSlideIndex[board.side];
			pce = LoopNonSlidePce[pceIndex++];
			while(pce != 0) {
				for(pceNum = 0; pceNum < board.pceNum[pce]; ++pceNum) {
					sq = board.pList[getPieceIndex(pce, pceNum)];
					for(index = 0; index < DirNum[pce]; index++) {
						dir = PceDir[pce]
							[index];
						t_sq = sq + dir;
						if(isSqOffBoard(t_sq) == true) {
							continue;
						}
						if(board.pieces[t_sq] != PIECES.EMPTY) {
							if(PieceCol[board.pieces[t_sq]] != board.side) {
								AddCaptureMove(MOVE(sq, t_sq, board.pieces[t_sq], PIECES.EMPTY, 0));
							}
						}
					}
				}
				pce = LoopNonSlidePce[pceIndex++];
			}
			pceIndex = LoopSlideIndex[board.side];
			pce = LoopSlidePce[pceIndex++];
			while(pce != 0) {
				for(pceNum = 0; pceNum < board.pceNum[pce]; ++pceNum) {
					sq = board.pList[getPieceIndex(pce, pceNum)];
					for(index = 0; index < DirNum[pce]; index++) {
						dir = PceDir[pce]
							[index];
						t_sq = sq + dir;
						while(isSqOffBoard(t_sq) == false) {
							if(board.pieces[t_sq] != PIECES.EMPTY) {
								if(PieceCol[board.pieces[t_sq]] != board.side) {
									AddCaptureMove(MOVE(sq, t_sq, board.pieces[t_sq], PIECES.EMPTY, 0));
								}
								break;
							}
							t_sq += dir;
						}
					}
				}
				pce = LoopSlidePce[pceIndex++];
			}
		}

		function PrMove(move) {
			var MvStr;
			var ff = FilesBrd[fromSQ(move)];
			var rf = RanksBrd[fromSQ(move)];
			var ft = FilesBrd[toSQ(move)];
			var rt = RanksBrd[toSQ(move)];
			MvStr = FileChar[ff] + RankChar[rf] + FileChar[ft] + RankChar[rt];
			var promoted = PROMOTED(move);
			if(promoted != PIECES.EMPTY) {
				var pchar = "q";
				if(PieceKnight[promoted] == true) {
					pchar = "n";
				}
				else if(PieceRookQueen[promoted] == true && PieceBishopQueen[promoted] == false) {
					pchar = "r";
				}
				else if(PieceRookQueen[promoted] == false && PieceBishopQueen[promoted] == true) {
					pchar = "b";
				}
				MvStr += pchar;
			}
			return MvStr;
		}

		function getMoveList() {
			CreateMoves();
			var index;
			var move;
			var moves = [];
			for(index = board.moveListStart[board.ply]; index < board.moveListStart[board.ply + 1];
				++index) {
				move = board.moveList[index];
				//console.martylog(move);
				from = fromSQ(move);
				to = toSQ(move);
				var parsed = ParseMove(from, to);
				if(parsed !== NOMOVE) {
					moves.push(PrMove(move).slice(0, 4));
				}
			}
			return moves;
		}
		(function() {
			var index = 0;
			var file = FILES.FILE_A;
			var rank = RANKS.RANK_1;
			var sq = SQUARES.A1;
			for(index = 0; index < BRD_SQ_NUM; ++index) {
				FilesBrd[index] = SQUARES.OFFBOARD;
				RanksBrd[index] = SQUARES.OFFBOARD;
			}
			for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
				for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
					sq = fileRanktoSquare(file, rank);
					FilesBrd[sq] = file;
					RanksBrd[sq] = rank;
				}
			}
			for(index = 0; index < 14 * 120; ++index) {
				PieceKeys[index] = getRand32();
			}
			SideKey = getRand32();
			for(index = 0; index < 16; ++index) {
				CastleKeys[index] = getRand32();
			}
			var file = FILES.FILE_A;
			var rank = RANKS.RANK_1;
			var sq = SQUARES.A1;
			var sq64 = 0;
			for(index = 0; index < BRD_SQ_NUM; ++index) {
				Sq120ToSq64[index] = 65;
			}
			for(index = 0; index < 64; ++index) {
				Sq64ToSq120[index] = 120;
			}
			for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
				for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
					sq = fileRanktoSquare(file, rank);
					Sq64ToSq120[sq64] = sq;
					Sq120ToSq64[sq] = sq64;
					sq64++;
				}
			}
			var index = 0;
			for(index = 0; index < MAXGAMEMOVES; ++index) {
				board.history.push({
					move: NOMOVE,
					castlePerm: 0,
					enPas: 0,
					fiftyMove: 0,
					posKey: 0,
				});
			}
			for(index = 0; index < PVENTRIES; ++index) {
				board.PvTable.push({
					move: NOMOVE,
					posKey: 0,
				});
			}
			var Attacker;
			var Victim;
			for(Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
				for(Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
					MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - MvvLvaValue[Attacker] / 100;
				}
			}
			ParseFen(START_FEN);
		})();

		function getMovesAtSquare(square) {
			var allMoves = getMoveList();
			var movesAtSquare = allMoves.filter((move) => move.slice(0, 2).includes(square));
			var possibleMoves = movesAtSquare.map((move) => move.slice(2, 4));
			return possibleMoves;
		}

		function move(from, to) {
			from = OppositePrSq(from);
			to = OppositePrSq(to);
			var parsed = ParseMove(from, to);
			if(parsed == NOMOVE) return false;
			else {
				MakeMove(parsed);
				return true;
			}
		}

		function reset() {
			ParseFen(START_FEN);
		}

		function fenToPieceCode(piece) {
			if(piece.toLowerCase() === piece) {
				return 'b' + piece.toUpperCase();
			}
			return 'w' + piece.toUpperCase();
		}
		return {
			fen: CreateFEN,
			load: ParseFen,
			getMovesAtSquare: getMovesAtSquare,
			move_piece: move,
			move: function(square) {
				var arr = square.split("");
				move(arr[0] + arr[1], arr[2] + arr[3]);
			},
			moves: getMoveList,
			undo: TakeMove,
			board: board,
			reset: reset,
			PIECES: PIECES,
			mirror64: mirror64,
			sq120to64: sq120to64,
			getPieceIndex: getPieceIndex,
			obj: function() {
				var COLUMNS = 'abcdefgh'.split('');
				fen = CreateFEN();
				fen = fen.replace(/ .+$/, '');
				var rows = fen.split('/');
				var position = {};
				var currentRow = 8;
				for(var i = 0; i < 8; i++) {
					var row = rows[i].split('');
					var colIdx = 0;
					for(var j = 0; j < row.length; j++) {
						if(row[j].search(/[1-8]/) !== -1) {
							var numEmptySquares = parseInt(row[j], 10);
							colIdx = colIdx + numEmptySquares;
						}
						else {
							var square = COLUMNS[colIdx] + currentRow;
							position[square] = fenToPieceCode(row[j]);
							colIdx = colIdx + 1;
						}
					}
					currentRow = currentRow - 1;
				}
				return position;
			}
		};
	};
	EngineGame = EngineGame();

	function minimaxCote(depth, game, isMaximisingPlayer) {
		EngineGame.load(game.fen());
		var newGameMoves = EngineGame.moves();
		var bestMove = -9999;
		var bestMoveValue = 0;
		var bestMoveFound;
		for(var i = 0; i < newGameMoves.length; i++) {
			var newGameMove = newGameMoves[i];
			EngineGame.move(newGameMove);
			var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
			EngineGame.undo();
			if(value >= bestMove) {
				bestMove = value;
				bestMoveFound = newGameMove;
				bestMoveValue = i;
			}
		}
		return bestMoveFound;
	}

	function minimax(depth, game, alpha, beta, isMaximisingPlayer) {
		if(depth === 0) {
			return martycolor == 'b' ? -evaluateBoard() : evaluateBoard();
		}
		var newGameMoves = EngineGame.moves();
		if(isMaximisingPlayer) {
			var bestMove = -9999;
			for(var i = 0; i < newGameMoves.length; i++) {
				EngineGame.move(newGameMoves[i]);
				bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
				EngineGame.undo();
				alpha = Math.max(alpha, bestMove);
				if(beta <= alpha) {
					return bestMove;
				}
			}
			return bestMove;
		}
		else {
			var bestMove = 9999;
			for(var i = 0; i < newGameMoves.length; i++) {
				EngineGame.move(newGameMoves[i]);
				bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
				EngineGame.undo();
				beta = Math.min(beta, bestMove);
				if(beta <= alpha) {
					return bestMove;
				}
			}
			return bestMove;
		}
	}
	function alphaBeta(alpha, beta, depth, root = true) {
		if(depth == 0) return martycolor == 'b' ? -evaluateBoard() : evaluateBoard();//Quiesce(alpha, beta);
		var newGameMoves = EngineGame.moves();
		var bestMove;
		newGameMoves.forEach(element => {
			EngineGame.move(element);
			var Move = alphaBeta(-beta, -alpha, depth - 1, false);
			var score = -Move[1];
			EngineGame.undo();
			if(score >= beta){
				bestMove = Move[0];
				return beta;//[bestMove, beta];
			}
			if(score > alpha){
				alpha = score;
				bestMove = element;
			}
		});
		return alpha;//root ? bestMove : [bestMove, alpha];
	}
	Marty.alphaBeta = alphaBeta;
	function negaMax(depth, isRoot = true) {
		if (depth == 0) return Marty.Quiesce(-100, 100, 2);//martycolor == 'b' ? -evaluateBoard() : evaluateBoard();
		var max = -9999;
		var newGameMoves = EngineGame.moves();
		var bestMove;
		newGameMoves.forEach(element => {
			EngineGame.move(element);
			var Move = negaMax(depth - 1, false);
			var score = -Move;
			EngineGame.undo();
			if(score > max){
				bestMove = element;
				max = score;
			}
		});
		return isRoot ? bestMove : max;
	}
	Marty.negaMax = negaMax;

	function isEndgame() {
		if (EngineGame.board.material[0] + EngineGame.board.material[1] < 105000) return true;
		return false;
	}
	Marty.isEndgame = isEndgame;

	/*function Quiesce(depth, alpha, beta, isMaximisingPlayer) {
		var newGameMoves = EngineGame.moves();
		var stand_pat = evaluateBoard();
		if(depth == 0) {
			return martycolor == 'b' ? -evaluateBoard() : evaluateBoard();
		}
		if(stand_pat >= beta) {
			return beta;
		}
		if(alpha < stand_pat) {
			alpha = stand_pat;
		}
		for(var i = 0; i < newGameMoves.length; i++) {
			EngineGame.move(newGameMoves[i]);
			score = -Quiesce(depth - 1, beta, alpha, !isMaximisingPlayer);
			EngineGame.undo();
			if(score >= beta) {
				return beta;
			}
			if(score > alpha) {
				alpha = score;
			}
		}
		return alpha;
	}*/
	function Quiesce(alpha, beta, depth) {
		var stand_pat = martycolor == 'b' ? -evaluateBoard() : evaluateBoard();
		if(depth == 0) {
			return stand_pat;
		}
		var newGameMoves = EngineGame.moves();
		if(stand_pat >= beta)
			return beta;
		if(alpha < stand_pat)
			alpha = stand_pat;
	
		newGameMoves.forEach(element => {
			EngineGame.move(element);
			score = -Quiesce(-beta, -alpha, depth-1);
			EngineGame.undo();
	
			if(score >= beta)
				return beta;
			if(score > alpha)
			   alpha = score;
		});
		return alpha;
	}
    Marty.Quiesce = Quiesce;

	function pieceCodeToArr(piece) {
		var pieceCodeLetters = piece.split('');
		return {
			color: pieceCodeLetters[0],
			type: pieceCodeLetters[1].toLowerCase()
		};
	}

	function evaluateBoard(board = EngineGame.obj(), totalEvaluation = 0) {
		//totalEvaluation += EngineGame.board.material[martycolor == 'w' ? 0 : 1];
		var COLUMNS = 'abcdefgh'.split('');
		for(var i = 0; i < 8; i++) {
			for(var j = 0; j < 8; j++) {
				if(board.hasOwnProperty(COLUMNS[i] + (j + 1))) {
					var find = board[(COLUMNS[i] + (j + 1))];
					totalEvaluation = totalEvaluation + getPieceValue(pieceCodeToArr(find), i, j);
				}
			}
		}
		if(game.in_checkmate()) {
			totalEvaluation = martycolor == game.turn() ? 10 * 10 : -10 * 10;
		}
		return martycolor == 'b' ? totalEvaluation : -totalEvaluation;
	}
	var EvalWhite = {
		pawn: [
			[0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0
			],
			[5.0, 5.0, 5.0, 5.0,
				5.0, 5.0, 5.0,
				5.0
			],
			[1.0, 1.0, 2.0, 3.0,
				3.0, 2.0, 1.0,
				1.0
			],
			[0.5, 0.5, 1.0, 2.5,
				2.5, 1.0, 0.5,
				0.5
			],
			[0.0, 0.0, 0.0, 2.0,
				2.0, 0.0, 0.0,
				0.0
			],
			[0.5, -0.5, -1.0,
				0.0, 0.0, -1.0, -0.5, 0.5
			],
			[0.5, 1.0, 1.0, -2.0, -2.0, 1.0,
				1.0, 0.5
			],
			[0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0
			]
		],
		knight: [
			[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
			[-4.0, -2.0, 0.0,
				0.0, 0.0, 0.0, -2.0, -4.0
			],
			[-3.0, 0.0, 1.0,
				1.5, 1.5, 1.0,
				0.0, -3.0
			],
			[-3.0, 0.5, 1.5,
				2.0, 2.0, 1.5,
				0.5, -3.0
			],
			[-3.0, 0.0, 1.5,
				2.0, 2.0, 1.5,
				0.0, -3.0
			],
			[-3.0, 0.5, 1.0,
				1.5, 1.5, 1.0,
				0.5, -3.0
			],
			[-4.0, -2.0, 0.0,
				0.5, 0.5, 0.0, -2.0, -4.0
			],
			[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
		],
		bishop: [
			[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
			[-1.0, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -1.0
			],
			[-1.0, 0.0, 0.5,
				1.0, 1.0, 0.5,
				0.0, -1.0
			],
			[-1.0, 0.5, 0.5,
				1.0, 1.0, 0.5,
				0.5, -1.0
			],
			[-1.0, 0.0, 1.0,
				1.0, 1.0, 1.0,
				0.0, -1.0
			],
			[-1.0, 1.0, 1.0,
				1.0, 1.0, 1.0,
				1.0, -1.0
			],
			[-1.0, 0.5, 0.0,
				0.0, 0.0, 0.0,
				0.5, -1.0
			],
			[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
		],
		rook: [
			[0.0, 0.0, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0
			],
			[0.5, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0,
				0.5
			],
			[-0.5, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -0.5
			],
			[-0.5, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -0.5
			],
			[-0.5, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -0.5
			],
			[-0.5, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -0.5
			],
			[-0.5, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -0.5
			],
			[0.0, 0.0, 0.0, 0.5,
				0.5, 0.0, 0.0,
				0.0
			]
		],
		queen: [
			[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
			[-1.0, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, -1.0
			],
			[-1.0, 0.0, 0.5,
				0.5, 0.5, 0.5,
				0.0, -1.0
			],
			[-0.5, 0.0, 0.5,
				0.5, 0.5, 0.5,
				0.0, -0.5
			],
			[0.0, 0.0, 0.5, 0.5,
				0.5, 0.5, 0.0, -0.5
			],
			[-1.0, 0.5, 0.5,
				0.5, 0.5, 0.5,
				0.0, -1.0
			],
			[-1.0, 0.0, 0.5,
				0.0, 0.0, 0.0,
				0.0, -1.0
			],
			[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
		],
		king: [
			[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
			[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
			[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
			[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
			[-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
			[-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
			[2.0, 2.0, 0.0, 0.0,
				0.0, 0.0, 2.0,
				2.0
			],
			[2.0, 3.0, 1.0, 0.0,
				0.0, 1.0, 3.0,
				2.0
			]
		]
	};
	var EvalBlack = {
		pawn: EvalWhite.pawn.slice().reverse(),
		bishop: EvalWhite.bishop.slice().reverse(),
		knight: EvalWhite.knight.slice().reverse(),
		rook: EvalWhite.rook.slice().reverse(),
		queen: EvalWhite.queen.slice().reverse(),
		king: EvalWhite.king.slice().reverse()
	};

	function getPieceValue(piece, x, y) {
		if(piece === null) {
			return 0;
		}

		function getAbsoluteValue(piece, isWhite, x, y) {
			if(piece.type === 'p') {
				return 10 + (isWhite ? EvalWhite.pawn[y][x] : EvalBlack.pawn[y][x]);
			}
			else if(piece.type === 'r') {
				return 50 + (isWhite ? EvalWhite.rook[y][x] : EvalBlack.rook[y][x]);
			}
			else if(piece.type === 'n') {
				return 30 + EvalWhite.knight[y][x];
			}
			else if(piece.type === 'b') {
				return 30 + (isWhite ? EvalWhite.bishop[y][x] : EvalBlack.bishop[y][x]);
			}
			else if(piece.type === 'q') {
				return 90 + EvalWhite.queen[y][x];
			}
			else if(piece.type === 'k') {
				return 900 + (isWhite ? EvalWhite.king[y][x] : EvalBlack.king[y][x]);
			}
			throw "Unknown piece type: " + piece.type;
		}
		var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x, y);
		return piece.color === 'w' ? absoluteValue : -absoluteValue;
	}
	Marty.Engine = function(depth, isNegaMax = false) {
		//depth = parseInt(depth) - 2;
		//if(depth == 0) console.martylog
		//var bestMove = minimaxCote(depth, game, martycolor == 'w');//negaMax(depth, true);
		if(isNegaMax){
			depth = parseInt(depth) - 2;
			if(depth == 0) return Marty.Engine(depth+2, false);
			var bestMove = negaMax(depth, true);
		} else {
			var bestMove = minimaxCote(depth, game, martycolor == 'w');
		}
		var bestMoveArr = bestMove.split("");
		var [from, to] = [
			bestMoveArr[0] + bestMoveArr[1],
			bestMoveArr[2] + bestMoveArr[3]
		];
		return {
			from: from,
			to: to,
			promotion: 'q'
		};
	}
	Marty.SetColor = function(color) {
		martycolor = color;
	}
	Marty.GetColor = function() {
		return martycolor;
	}
	Marty.Setlog = function(log) {
		martylog = log;
		console.martylog = martylog;
	}
	Marty.Getlog = function() {
		return martylog;
	}
	Marty.Command = function(command) {
		function GetCommand(msg, command, notdef) {
			var r = command.exec(msg);
			return r ? r[1] | 0 : notdef;
		}
		var commandArr = command.split(" ");
		switch (commandArr[0]) {
			case ':help':
				console.martylog('Command : explanation');
				console.martylog(':help : All comments and their explanations.');
				console.martylog(':move : Returns the best number of matiengines.');
				console.martylog('	depth: calculation depth.');
				console.martylog('		Example: :move depth 3');
				console.martylog('		Example answer: {from: "d2", to: "d4", promotion: \'q\'}');
				console.martylog(':negaMax : Returns the best number of matiengines.');
				console.martylog('	depth: calculation depth.');
				console.martylog('		Example: :negaMax depth 3');
				console.martylog('		Example answer: {from: "d2", to: "d4", promotion: \'q\'}');
				break;
			case ':move':
				console.martylog(Marty.Engine(commandArr[2]));
				break;
			case ':negaMax':
				console.martylog(Marty.Engine(commandArr[2], true));
				break;
			default:
				console.martylog("I don't know what you're talking about. :(");
				console.martylog("	See :help?");
				break;
		}
	}
	Marty.EngineGame = EngineGame;
	Marty.load = game.load;
	Marty.fen = game.fen;
	Marty.pgn = game.pgn;
	Marty.load_pgn = game.load_pgn;
	Marty.game = game;
	return Marty;
}
/*
class MartyEnginePlay{
    constructor(){}
    run(data){
        return Function(atob(data)+'\n return MartyEngine;');
    }
}*/
if(!window.MARTY || !window.MARTY.MartyEngine){
	window.MARTY = {MartyEngine: {functions: null, isWorker: false}};
	onmessage = function(e) {
		if(window.MARTY.isWorker == false){
			window.MARTY.MartyEngine.functions = new MartyEngine(new Chess(), 'w', (log) => {
				console.log("MartyEngine: "+(log));
				postMessage("MartyEngine: "+(log));
			});
			postMessage("Hi? I`m MartyEngine!");
			postMessage("List of Commands: :help.");
		}
		window.MARTY.MartyEngine.functions.Command(e.data);
	}
}
